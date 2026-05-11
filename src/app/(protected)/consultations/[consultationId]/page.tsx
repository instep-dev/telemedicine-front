"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Video, { type RemoteParticipant, type RemoteTrack, type Room } from "twilio-video";
import { authStore } from "@/services/auth/auth.store";
import { twilioApi } from "@/services/twillio/twilio.api";
import {
  useDoctorTokenMutation,
  useEndCallMutation,
  useNurseTokenMutation,
  usePatientTokenMutation,
} from "@/services/twillio/twilio.queries";
import {
  MicrophoneIcon,
  MicrophoneSlashIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  PhoneSlashIcon,
  CaretUpIcon,
  UserCircleIcon,
  CircleNotchIcon,
  CheckIcon,
} from "@phosphor-icons/react";

// ─── RemoteParticipantTile ───────────────────────────────────────────────────
// Dedicated stable component per remote participant. Uses useRef for the video
// container so parent re-renders never trigger inline ref callbacks that would
// clear and re-attach the video element (which caused the flickering).

interface RemoteParticipantTileProps {
  sid: string;
  displayName: string;
  isSplitView: boolean;
  onMount: (sid: string, el: HTMLDivElement) => void;
  onUnmount: (sid: string) => void;
}

const RemoteParticipantTile = React.memo(function RemoteParticipantTile({
  sid,
  displayName,
  isSplitView,
  onMount,
  onUnmount,
}: RemoteParticipantTileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Keep the latest callbacks in refs so the effect deps stay stable
  const onMountRef = useRef(onMount);
  const onUnmountRef = useRef(onUnmount);
  onMountRef.current = onMount;
  onUnmountRef.current = onUnmount;

  useEffect(() => {
    const el = containerRef.current;
    if (el) onMountRef.current(sid, el);
    return () => onUnmountRef.current(sid);
  }, [sid]); // only re-runs if the participant identity changes

  return (
    <div className={isSplitView ? "relative flex-1 overflow-hidden" : "absolute inset-0"}>
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <span className="bg-black/50 backdrop-blur-sm text-white/90 text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg">
          {displayName}
        </span>
      </div>
    </div>
  );
});
// ─────────────────────────────────────────────────────────────────────────────

type DeviceOption = { deviceId: string; label: string };
type RemoteParticipantEntry = { sid: string; identity: string };

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ConsultationSessionPage() {
  const params = useParams<{ consultationId: string }>();
  const sessionId = params?.consultationId ? String(params.consultationId) : "";
  const router = useRouter();

  const accessToken = authStore((s) => s.accessToken);
  const user = authStore((s) => s.user);

  const doctorTokenMutation = useDoctorTokenMutation(accessToken);
  const patientTokenMutation = usePatientTokenMutation(accessToken);
  const nurseTokenMutation = useNurseTokenMutation(accessToken);
  const endCallMutation = useEndCallMutation(accessToken);

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [consultationMode, setConsultationMode] = useState<"VIDEO" | "VOICE">("VIDEO");
  const [isEnding, setIsEnding] = useState(false);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [audioDevices, setAudioDevices] = useState<DeviceOption[]>([]);
  const [videoDevices, setVideoDevices] = useState<DeviceOption[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);

  const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipantEntry[]>([]);

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteContainersRef = useRef<Map<string, HTMLElement>>(new Map());
  const audioElsRef = useRef<HTMLElement[]>([]);
  const isCleaningRef = useRef(false);
  const hasStartedRef = useRef(false);
  const transcriptionBufferRef = useRef<string[]>([]);
  const transcriptionFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Maps Twilio identity strings to display names, populated from token response
  const participantNamesRef = useRef<Record<string, string>>({});

  const isDoctor = user?.role === "DOCTOR";
  const isPatient = user?.role === "PATIENT";
  const isNurse = user?.role === "NURSE";
  const isVoiceMode = consultationMode === "VOICE";

  const pageTitle = useMemo(() => {
    if (isDoctor) return "Doctor Room";
    if (isPatient) return "Patient Room";
    if (isNurse) return "Nurse Room";
    return "Consultation Room";
  }, [isDoctor, isPatient, isNurse]);

  useEffect(() => {
    if (!connected) return;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [connected]);

  // Enumerate devices and detect which ones are currently active
  useEffect(() => {
    if (!connected) return;
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        setAudioDevices(
          devices
            .filter((d) => d.kind === "audioinput")
            .map((d) => ({ deviceId: d.deviceId, label: d.label })),
        );
        setVideoDevices(
          devices
            .filter((d) => d.kind === "videoinput")
            .map((d) => ({ deviceId: d.deviceId, label: d.label })),
        );
        // Mark the currently active devices as selected
        const room = roomRef.current;
        if (room) {
          for (const pub of room.localParticipant.audioTracks.values()) {
            const deviceId = (pub.track as any)?.mediaStreamTrack?.getSettings?.()?.deviceId;
            if (deviceId) { setSelectedAudioId(deviceId); break; }
          }
          for (const pub of room.localParticipant.videoTracks.values()) {
            const deviceId = (pub.track as any)?.mediaStreamTrack?.getSettings?.()?.deviceId;
            if (deviceId) { setSelectedVideoId(deviceId); break; }
          }
        }
      })
      .catch(() => {});
  }, [connected]);

  useEffect(() => {
    if (!showAudioMenu && !showVideoMenu) return;
    const close = () => {
      setShowAudioMenu(false);
      setShowVideoMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showAudioMenu, showVideoMenu]);

  function clearContainers() {
    if (localRef.current) localRef.current.innerHTML = "";
    remoteContainersRef.current.forEach((container) => {
      container.innerHTML = "";
    });
  }

  function clearAudioEls() {
    for (const el of audioElsRef.current) {
      try {
        (el as any).remove?.();
      } catch {
        try {
          const p = el.parentNode as HTMLElement | null;
          if (p && p.contains(el)) p.removeChild(el);
        } catch {}
      }
    }
    audioElsRef.current = [];
  }

  function stopLocalTracks(room: Room) {
    room.localParticipant.tracks.forEach((pub) => {
      const track = pub.track as any;
      try { track?.stop?.(); } catch {}
    });
  }

  async function flushTranscriptions() {
    if (!accessToken || !sessionId || !isDoctor) return;
    const buffer = transcriptionBufferRef.current;
    if (!buffer.length) return;
    transcriptionBufferRef.current = [];
    try {
      await twilioApi.sendTranscription(accessToken, {
        sessionId,
        transcription: buffer.join("\n"),
      });
    } catch {}
  }

  function scheduleTranscriptionFlush() {
    if (transcriptionFlushTimerRef.current) return;
    transcriptionFlushTimerRef.current = setTimeout(() => {
      transcriptionFlushTimerRef.current = null;
      void flushTranscriptions();
    }, 1500);
  }

  function handleTranscriptionEvent(event: any) {
    if (!isDoctor || !event) return;
    const isFinalFlag =
      event?.isFinal ?? event?.final ?? event?.transcription?.isFinal ?? event?.transcription?.final;
    if (isFinalFlag === false) return;
    const type = event?.type ?? event?.transcription?.type;
    if (typeof type === "string" && type.toLowerCase() === "partial") return;
    let text = "";
    if (typeof event?.transcription === "string") {
      text = event.transcription;
    } else if (event?.transcription) {
      text = event.transcription.transcription ?? event.transcription.text ?? event.transcription.transcript ?? "";
    } else {
      text = event?.text ?? event?.transcript ?? "";
    }
    text = String(text).trim();
    if (!text) return;
    transcriptionBufferRef.current.push(text);
    scheduleTranscriptionFlush();
  }

  function cleanupRoom() {
    if (isCleaningRef.current) return;
    isCleaningRef.current = true;
    const room = roomRef.current;
    roomRef.current = null;
    try {
      if (room) {
        try { room.removeAllListeners(); room.participants.forEach((p) => p.removeAllListeners()); } catch {}
        try { stopLocalTracks(room); } catch {}
        try { if ((room as any).state !== "disconnected") room.disconnect(); } catch {}
      }
    } finally {
      if (transcriptionFlushTimerRef.current) {
        clearTimeout(transcriptionFlushTimerRef.current);
        transcriptionFlushTimerRef.current = null;
      }
      void flushTranscriptions();
      clearContainers();
      clearAudioEls();
      setConnected(false);
      setRemoteParticipants([]);
      isCleaningRef.current = false;
    }
  }

  useEffect(() => {
    return () => cleanupRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function attachTrackToContainer(track: any, container: HTMLElement, fit: "cover" | "contain") {
    const el: HTMLElement = track.attach();
    (el as any).style.width = "100%";
    (el as any).style.height = "100%";
    (el as any).style.objectFit = fit;
    container.appendChild(el);
  }

  function attachRemoteVideo(track: any, container: HTMLElement) {
    container.innerHTML = "";
    attachTrackToContainer(track, container, "cover");
  }

  function attachLocalVideo(room: Room) {
    if (!localRef.current) return;
    localRef.current.innerHTML = "";
    room.localParticipant.tracks.forEach((pub) => {
      const track: any = pub.track;
      if (track && track.kind === "video") {
        attachTrackToContainer(track, localRef.current!, "cover");
      }
    });
  }

  function attachTrackToParticipant(participantSid: string, track: any) {
    if (isCleaningRef.current) return;
    if (track.kind === "video") {
      const container = remoteContainersRef.current.get(participantSid);
      if (container) attachRemoteVideo(track, container);
    } else if (track.kind === "audio") {
      const audioEl = track.attach();
      (audioEl as any).style.display = "none";
      document.body.appendChild(audioEl);
      audioElsRef.current.push(audioEl);
    }
  }

  // Registered by RemoteParticipantTile on mount — attaches any already-subscribed video
  const handleRemoteMount = useCallback((sid: string, el: HTMLDivElement) => {
    remoteContainersRef.current.set(sid, el);
    const room = roomRef.current;
    if (!room) return;
    const participant = room.participants.get(sid);
    if (!participant) return;
    participant.tracks.forEach((pub: any) => {
      if (pub.isSubscribed && pub.track && pub.track.kind === "video") {
        attachRemoteVideo(pub.track, el);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Registered by RemoteParticipantTile on unmount
  const handleRemoteUnmount = useCallback((sid: string) => {
    remoteContainersRef.current.delete(sid);
  }, []);

  function handleRemoteParticipant(participant: RemoteParticipant) {
    if (isCleaningRef.current) return;

    setRemoteParticipants((prev) => {
      if (prev.some((p) => p.sid === participant.sid)) return prev;
      return [...prev, { sid: participant.sid, identity: participant.identity ?? "" }];
    });

    // Handle already-subscribed audio tracks immediately; video is handled on tile mount
    participant.tracks.forEach((pub: any) => {
      if (isCleaningRef.current) return;
      if (pub.isSubscribed && pub.track && pub.track.kind === "audio") {
        attachTrackToParticipant(participant.sid, pub.track as RemoteTrack);
      }
    });

    participant.on("trackSubscribed", (track: RemoteTrack) => {
      if (isCleaningRef.current) return;
      attachTrackToParticipant(participant.sid, track as any);
    });

    participant.on("trackUnsubscribed", (track: RemoteTrack) => {
      if (isCleaningRef.current) return;
      const t: any = track;
      if (t.kind === "video") {
        const container = remoteContainersRef.current.get(participant.sid);
        if (container) container.innerHTML = "";
      }
    });
  }

  async function connectSession() {
    if (!sessionId || !accessToken || !user) return;
    if (isCleaningRef.current) return;
    if (roomRef.current) return;
    if (doctorTokenMutation.isPending || patientTokenMutation.isPending || nurseTokenMutation.isPending) return;
    setErrMsg(null);
    try {
      const tokenData = isDoctor
        ? await doctorTokenMutation.mutateAsync({ sessionId })
        : isNurse
        ? await nurseTokenMutation.mutateAsync({ sessionId })
        : await patientTokenMutation.mutateAsync({ sessionId });
      const mode = tokenData.consultationMode ?? "VIDEO";
      setConsultationMode(mode);

      // Populate identity → display name lookup before any participants render
      if (tokenData.participantNames) {
        Object.assign(participantNamesRef.current, tokenData.participantNames);
      }

      let room: Room;
      let actuallyVideo = mode === "VIDEO";
      try {
        room = await Video.connect(tokenData.token, {
          name: tokenData.roomName,
          audio: true,
          video: actuallyVideo,
          receiveTranscriptions: isDoctor,
        });
      } catch (mediaErr: any) {
        const msg: string = mediaErr?.message ?? "";
        const isVideoError =
          actuallyVideo &&
          (msg.toLowerCase().includes("video") ||
            msg.toLowerCase().includes("camera") ||
            msg.toLowerCase().includes("source") ||
            msg.toLowerCase().includes("notreadable") ||
            msg.toLowerCase().includes("notallowed") ||
            msg.toLowerCase().includes("permission"));
        if (isVideoError) {
          actuallyVideo = false;
          setConsultationMode("VOICE");
          room = await Video.connect(tokenData.token, {
            name: tokenData.roomName,
            audio: true,
            video: false,
            receiveTranscriptions: isDoctor,
          });
        } else {
          throw mediaErr;
        }
      }

      roomRef.current = room;
      setConnected(true);
      const startMuted = isNurse;
      setMicOn(!startMuted);
      if (startMuted) {
        room.localParticipant.audioTracks.forEach((pub: any) => {
          try { pub.track?.disable(); } catch {}
        });
      }
      setCamOn(actuallyVideo);
      if (actuallyVideo) attachLocalVideo(room);
      if (isDoctor) room.on("transcription", handleTranscriptionEvent);
      room.participants.forEach((p) => handleRemoteParticipant(p));
      room.on("participantConnected", (p) => handleRemoteParticipant(p));
      room.on("participantDisconnected", (p: RemoteParticipant) => {
        if (isCleaningRef.current) return;
        remoteContainersRef.current.delete(p.sid);
        setRemoteParticipants((prev) => prev.filter((x) => x.sid !== p.sid));
      });
      room.on("disconnected", () => {
        cleanupRoom();
        if (isPatient) router.replace("/patient/schedule");
        if (isNurse) router.replace("/nurse/schedule");
      });
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to join session");
      cleanupRoom();
    }
  }

  useEffect(() => {
    if (!sessionId || !accessToken || !user) return;
    if (!(isDoctor || isPatient || isNurse)) {
      setErrMsg("Only doctors, patients, or nurses are allowed to join a consultation.");
      return;
    }
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    cleanupRoom();
    void connectSession();
    return () => {
      cleanupRoom();
      hasStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, accessToken, user?.role, isNurse]);

  function toggleMic() {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    room.localParticipant.audioTracks.forEach((pub: any) => {
      const track: any = pub.track;
      try { next ? track.enable() : track.disable(); } catch {}
    });
    setMicOn(next);
  }

  function toggleCam() {
    if (isVoiceMode) return;
    const room = roomRef.current;
    if (!room) return;
    const next = !camOn;
    room.localParticipant.videoTracks.forEach((pub: any) => {
      const track: any = pub.track;
      try { next ? track.enable() : track.disable(); } catch {}
    });
    setCamOn(next);
  }

  async function switchAudioDevice(deviceId: string) {
    setSelectedAudioId(deviceId);
    setShowAudioMenu(false);
    const room = roomRef.current;
    if (!room) return;
    try {
      for (const pub of room.localParticipant.audioTracks.values()) {
        if (!pub.track) continue;
        await (pub.track as any).restart({ deviceId: { exact: deviceId } });
        break;
      }
    } catch {}
  }

  async function switchVideoDevice(deviceId: string) {
    setSelectedVideoId(deviceId);
    setShowVideoMenu(false);
    const room = roomRef.current;
    if (!room) return;
    try {
      for (const pub of room.localParticipant.videoTracks.values()) {
        if (!pub.track) continue;
        // restart() updates the existing attached video elements automatically
        await (pub.track as any).restart({ deviceId: { exact: deviceId } });
        break;
      }
    } catch {}
  }

  async function endCall() {
    if (!isDoctor || !sessionId || !accessToken || isEnding || endCallMutation.isPending) return;
    setErrMsg(null);
    setIsEnding(true);
    try {
      await flushTranscriptions();
      await endCallMutation.mutateAsync(sessionId);
      cleanupRoom();
      hasStartedRef.current = false;
      router.replace("/doctor/ai-summary");
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to end call");
      setIsEnding(false);
    }
  }

  const isConnecting = !connected && !errMsg;
  const hasRemote = remoteParticipants.length > 0;
  const isSplitView = remoteParticipants.length >= 2;

  // ── UI ───────────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#202124] overflow-hidden">

      {/* ═══ MAIN VIDEO AREA ═══ */}
      <div className="flex-1 relative overflow-hidden bg-[#3c4043] min-h-0">

        {/*
          Remote videos.
          1 participant  → fullscreen (absolute inset-0)
          2 participants → portrait-mobile: stacked top/bottom (flex-col)
                           landscape / sm+:  side-by-side (sm:flex-row)
        */}
        <div
          className={`absolute inset-0 flex ${
            isSplitView
              ? "flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/10"
              : ""
          }`}
        >
          {remoteParticipants.map(({ sid, identity }) => (
            <RemoteParticipantTile
              key={sid}
              sid={sid}
              displayName={participantNamesRef.current[identity] ?? identity}
              isSplitView={isSplitView}
              onMount={handleRemoteMount}
              onUnmount={handleRemoteUnmount}
            />
          ))}
        </div>

        {/* Placeholder when no remote participants or voice mode */}
        {(!connected || isVoiceMode || !hasRemote) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 pointer-events-none">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-[#5f6368] flex items-center justify-center shadow-xl">
              <UserCircleIcon size={48} weight="thin" className="text-white/40 sm:hidden" />
              <UserCircleIcon size={64} weight="thin" className="text-white/40 hidden sm:block" />
            </div>
            {isVoiceMode && hasRemote && (
              <p className="text-white/70 text-sm sm:text-base font-medium">
                {remoteParticipants
                  .map((p) => participantNamesRef.current[p.identity] ?? p.identity)
                  .join(", ")}
              </p>
            )}
            <p className="text-white/30 text-xs sm:text-sm text-center px-6">
              {!connected
                ? isConnecting
                  ? "Connecting..."
                  : "Failed to connect"
                : isVoiceMode
                ? "Voice call in progress"
                : "Waiting for other participant..."}
            </p>
          </div>
        )}

        {/* Connecting spinner overlay */}
        {isConnecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <CircleNotchIcon className="animate-spin text-white/50" size={48} />
          </div>
        )}

        {/* Error / warning toast */}
        {errMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-2rem)] sm:w-auto">
            <div className="bg-red-600/90 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-2xl border border-red-500/30 text-center">
              {errMsg}
            </div>
          </div>
        )}

        {/*
          Local PiP — scales down on small screens.
          Mobile: 100px wide  |  sm: 140px  |  md+: 200px
        */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <div className="w-[100px] sm:w-[140px] md:w-[200px] aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#202124] border border-white/10 shadow-2xl relative">
            <div ref={localRef} className="w-full h-full" />

            {(!connected || isVoiceMode || !camOn) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                <UserCircleIcon size={28} weight="thin" className="text-white/25 sm:hidden" />
                <UserCircleIcon size={36} weight="thin" className="text-white/25 hidden sm:block" />
              </div>
            )}

            <div className="absolute bottom-1 left-1.5 pointer-events-none">
              <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded">
                {user?.name ?? "You"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM CONTROL BAR ═══ */}
      <div className="shrink-0 bg-[#202124] border-t border-white/[0.06] flex items-center px-3 sm:px-5 gap-2 h-[60px] sm:h-[72px]">

        {/* Left: session info */}
        <div className="flex-1 flex items-center gap-1.5 sm:gap-2 min-w-0 overflow-hidden">
          <span className="text-white/90 text-xs sm:text-sm font-medium truncate hidden sm:block max-w-[120px] lg:max-w-[160px]">
            {pageTitle}
          </span>
          <span className="text-white/25 text-xs hidden sm:block">•</span>
          <span className="text-white/60 text-xs sm:text-sm tabular-nums shrink-0">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-white/25 text-xs hidden md:block">•</span>
          <span className="text-white/25 text-[11px] font-mono truncate hidden md:block">
            {sessionId.length > 12 ? `${sessionId.slice(0, 12)}…` : sessionId}
          </span>
        </div>

        {/* Center: controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

          {/* ── Microphone + device picker ── */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {showAudioMenu && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#292a2d] border border-white/10 rounded-2xl shadow-2xl py-2 w-[min(256px,calc(100vw-1.5rem))] z-50 overflow-hidden">
                <p className="text-white/30 text-[10px] uppercase tracking-[0.12em] font-medium px-4 pt-1 pb-2.5">
                  Microphone
                </p>
                {audioDevices.length === 0 ? (
                  <p className="text-white/40 text-sm px-4 pb-2">No devices found</p>
                ) : (
                  audioDevices.map((d) => (
                    <button
                      key={d.deviceId}
                      onClick={() => switchAudioDevice(d.deviceId)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.07] active:bg-white/10"
                    >
                      <CheckIcon
                        size={14}
                        weight="bold"
                        className={selectedAudioId === d.deviceId ? "text-[#8ab4f8] shrink-0" : "text-transparent shrink-0"}
                      />
                      <span className={`truncate ${selectedAudioId === d.deviceId ? "text-[#8ab4f8]" : "text-white/80"}`}>
                        {d.label || `Microphone (${d.deviceId.slice(0, 6)})`}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            <div className="flex items-end gap-0.5">
              <button
                onClick={toggleMic}
                disabled={!connected || isEnding}
                title={micOn ? "Mute microphone" : "Unmute microphone"}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                  micOn
                    ? "bg-white/10 hover:bg-white/[0.16] active:bg-white/20 text-white"
                    : "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
                }`}
              >
                {micOn
                  ? <MicrophoneIcon size={18} weight="fill" />
                  : <MicrophoneSlashIcon size={18} weight="fill" />}
              </button>
              <button
                onClick={() => { setShowAudioMenu((v) => !v); setShowVideoMenu(false); }}
                disabled={!connected}
                className="hidden sm:flex w-[18px] h-[18px] mb-0.5 rounded-full bg-[#3c4043] border border-white/15 items-center justify-center text-white/50 hover:text-white hover:bg-[#52565a] transition-colors disabled:opacity-30"
              >
                <CaretUpIcon size={9} weight="bold" />
              </button>
            </div>
          </div>

          {/* ── Camera + device picker ── */}
          {!isVoiceMode && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              {showVideoMenu && (
                <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#292a2d] border border-white/10 rounded-2xl shadow-2xl py-2 w-[min(256px,calc(100vw-1.5rem))] z-50 overflow-hidden">
                  <p className="text-white/30 text-[10px] uppercase tracking-[0.12em] font-medium px-4 pt-1 pb-2.5">
                    Camera
                  </p>
                  {videoDevices.length === 0 ? (
                    <p className="text-white/40 text-sm px-4 pb-2">No cameras found</p>
                  ) : (
                    videoDevices.map((d) => (
                      <button
                        key={d.deviceId}
                        onClick={() => switchVideoDevice(d.deviceId)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.07] active:bg-white/10"
                      >
                        <CheckIcon
                          size={14}
                          weight="bold"
                          className={selectedVideoId === d.deviceId ? "text-[#8ab4f8] shrink-0" : "text-transparent shrink-0"}
                        />
                        <span className={`truncate ${selectedVideoId === d.deviceId ? "text-[#8ab4f8]" : "text-white/80"}`}>
                          {d.label || `Camera (${d.deviceId.slice(0, 6)})`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="flex items-end gap-0.5">
                <button
                  onClick={toggleCam}
                  disabled={!connected || isEnding}
                  title={camOn ? "Turn off camera" : "Turn on camera"}
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                    camOn
                      ? "bg-white/10 hover:bg-white/[0.16] active:bg-white/20 text-white"
                      : "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white"
                  }`}
                >
                  {camOn
                    ? <VideoCameraIcon size={18} weight="fill" />
                    : <VideoCameraSlashIcon size={18} weight="fill" />}
                </button>
                <button
                  onClick={() => { setShowVideoMenu((v) => !v); setShowAudioMenu(false); }}
                  disabled={!connected}
                  className="hidden sm:flex w-[18px] h-[18px] mb-0.5 rounded-full bg-[#3c4043] border border-white/15 items-center justify-center text-white/50 hover:text-white hover:bg-[#52565a] transition-colors disabled:opacity-30"
                >
                  <CaretUpIcon size={9} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {/* ── End Call / Leave ── */}
          <button
            onClick={
              isDoctor
                ? endCall
                : () => { cleanupRoom(); router.replace(isNurse ? "/nurse/schedule" : "/patient/schedule"); }
            }
            disabled={isEnding}
            title={isDoctor ? "End call for everyone" : "Leave call"}
            className="mx-1 sm:mx-2 w-12 h-11 sm:w-14 sm:h-12 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-red-900/40"
          >
            {isEnding
              ? <CircleNotchIcon size={18} className="animate-spin text-white" />
              : <PhoneSlashIcon size={18} weight="fill" className="text-white" />}
          </button>
        </div>

        {/* Right: spacer to keep controls centered */}
        <div className="flex-1" />
      </div>
    </div>
  );
}
