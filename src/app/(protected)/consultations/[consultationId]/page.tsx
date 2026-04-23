"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Video, { type RemoteParticipant, type RemoteTrack, type Room } from "twilio-video";
import { authStore } from "@/services/auth/auth.store";
import { twilioApi } from "@/services/twillio/twilio.api";
import {
  useDoctorTokenMutation,
  useEndCallMutation,
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

type DeviceOption = { deviceId: string; label: string };

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
  const endCallMutation = useEndCallMutation(accessToken);

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [consultationMode, setConsultationMode] = useState<"VIDEO" | "VOICE">("VIDEO");
  const [isEnding, setIsEnding] = useState(false);

  // Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Device selection
  const [audioDevices, setAudioDevices] = useState<DeviceOption[]>([]);
  const [videoDevices, setVideoDevices] = useState<DeviceOption[]>([]);
  const [selectedAudioId, setSelectedAudioId] = useState<string>("");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [showVideoMenu, setShowVideoMenu] = useState(false);

  // Remote participant name
  const [remoteName, setRemoteName] = useState<string>("");

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);
  const audioElsRef = useRef<HTMLElement[]>([]);
  const isCleaningRef = useRef(false);
  const hasStartedRef = useRef(false);
  const transcriptionBufferRef = useRef<string[]>([]);
  const transcriptionFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDoctor = user?.role === "DOCTOR";
  const isPatient = user?.role === "PATIENT";
  const isVoiceMode = consultationMode === "VOICE";

  const pageTitle = useMemo(() => {
    if (isDoctor) return "Doctor Room";
    if (isPatient) return "Patient Room";
    return "Consultation Room";
  }, [isDoctor, isPatient]);

  // Timer
  useEffect(() => {
    if (!connected) return;
    setElapsedSeconds(0);
    const id = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [connected]);

  // Enumerate devices after connected
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
      })
      .catch(() => {});
  }, [connected]);

  // Close device menus on outside click
  useEffect(() => {
    if (!showAudioMenu && !showVideoMenu) return;
    const close = () => {
      setShowAudioMenu(false);
      setShowVideoMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showAudioMenu, showVideoMenu]);

  // ── existing helpers ─────────────────────────────────────────────────────────

  function clearContainers() {
    if (localRef.current) localRef.current.innerHTML = "";
    if (remoteRef.current) remoteRef.current.innerHTML = "";
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

  function handleRemoteParticipant(participant: RemoteParticipant) {
    if (isCleaningRef.current) return;
    setRemoteName(participant.identity ?? "");

    participant.tracks.forEach((pub: any) => {
      if (isCleaningRef.current) return;
      if (pub.isSubscribed && pub.track) {
        const track: any = pub.track as RemoteTrack;
        if (track.kind === "video") {
          if (!remoteRef.current) return;
          attachRemoteVideo(track, remoteRef.current);
        } else if (track.kind === "audio") {
          const audioEl = track.attach();
          (audioEl as any).style.display = "none";
          document.body.appendChild(audioEl);
          audioElsRef.current.push(audioEl);
        }
      }
    });

    participant.on("trackSubscribed", (track: RemoteTrack) => {
      if (isCleaningRef.current) return;
      const t: any = track;
      if (t.kind === "video") {
        if (!remoteRef.current) return;
        attachRemoteVideo(t, remoteRef.current);
      } else if (t.kind === "audio") {
        const audioEl = (t as any).attach();
        (audioEl as any).style.display = "none";
        document.body.appendChild(audioEl);
        audioElsRef.current.push(audioEl);
      }
    });

    participant.on("trackUnsubscribed", (track: RemoteTrack) => {
      if (isCleaningRef.current) return;
      const t: any = track;
      if (t.kind === "video" && remoteRef.current) remoteRef.current.innerHTML = "";
    });
  }

  async function connectSession() {
    if (!sessionId || !accessToken || !user) return;
    if (isCleaningRef.current) return;
    if (roomRef.current) return;
    if (doctorTokenMutation.isPending || patientTokenMutation.isPending) return;
    setErrMsg(null);
    try {
      const tokenData = isDoctor
        ? await doctorTokenMutation.mutateAsync({ sessionId })
        : await patientTokenMutation.mutateAsync({ sessionId });
      const mode = tokenData.consultationMode ?? "VIDEO";
      setConsultationMode(mode);
      const room = await Video.connect(tokenData.token, {
        name: tokenData.roomName,
        audio: true,
        video: mode === "VIDEO",
        receiveTranscriptions: isDoctor,
      });
      roomRef.current = room;
      setConnected(true);
      setMicOn(true);
      setCamOn(mode === "VIDEO");
      if (mode === "VIDEO") attachLocalVideo(room);
      if (isDoctor) room.on("transcription", handleTranscriptionEvent);
      room.participants.forEach((p) => handleRemoteParticipant(p));
      room.on("participantConnected", (p) => handleRemoteParticipant(p));
      room.on("participantDisconnected", () => {
        if (remoteRef.current) remoteRef.current.innerHTML = "";
        setRemoteName("");
      });
      room.on("disconnected", () => {
        cleanupRoom();
        if (isPatient) router.replace("/patient/schedule");
      });
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to join session");
      cleanupRoom();
    }
  }

  useEffect(() => {
    if (!sessionId || !accessToken || !user) return;
    if (!(isDoctor || isPatient)) {
      setErrMsg("Only doctors or patients are allowed to join a consultation.");
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
  }, [sessionId, accessToken, user?.role]);

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
        await (pub.track as any).restart({ deviceId: { exact: deviceId } });
        attachLocalVideo(room);
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

  // ── UI ───────────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-screen flex flex-col bg-[#202124] overflow-hidden">

      {/* ═══ MAIN VIDEO AREA ═══ */}
      <div className="flex-1 relative overflow-hidden bg-[#3c4043]">

        {/* Remote video fill */}
        <div ref={remoteRef} className="absolute inset-0" />

        {/* Remote placeholder */}
        {(!connected || isVoiceMode || !remoteName) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
            <div className="w-28 h-28 rounded-full bg-[#5f6368] flex items-center justify-center shadow-xl">
              <UserCircleIcon size={64} weight="thin" className="text-white/40" />
            </div>
            {remoteName && (
              <p className="text-white/70 text-base font-medium">{remoteName}</p>
            )}
            <p className="text-white/30 text-sm">
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
            <CircleNotchIcon className="animate-spin text-white/50" size={52} />
          </div>
        )}

        {/* Error toast */}
        {errMsg && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-red-600/90 backdrop-blur-sm text-white text-sm px-5 py-2.5 rounded-xl shadow-2xl border border-red-500/30">
              {errMsg}
            </div>
          </div>
        )}

        {/* Remote name label (bottom-left of video) */}
        {connected && remoteName && (
          <div className="absolute bottom-4 left-4 pointer-events-none">
            <span className="bg-black/50 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1 rounded-lg">
              {remoteName}
            </span>
          </div>
        )}

        {/* ── Local PiP (top-right) ── */}
        <div className="absolute top-4 right-4 z-10">
          <div className="w-[200px] aspect-video rounded-2xl overflow-hidden bg-[#202124] border border-white/10 shadow-2xl">
            {/* local video track will attach here */}
            <div ref={localRef} className="w-full h-full" />

            {/* placeholder if no video */}
            {(!connected || isVoiceMode || !camOn) && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#3c4043]">
                <UserCircleIcon size={36} weight="thin" className="text-white/25" />
              </div>
            )}

            {/* "You" label */}
            <div className="absolute bottom-1.5 left-2 pointer-events-none">
              <span className="bg-black/50 backdrop-blur-sm text-white/80 text-[10px] px-1.5 py-0.5 rounded">
                {user?.name ?? "You"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM CONTROL BAR ═══ */}
      <div className="shrink-0 h-[72px] bg-[#202124] border-t border-white/[0.06] flex items-center px-5 gap-2">

        {/* Left: session info */}
        <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="text-white/90 text-sm font-medium truncate max-w-[130px]">{pageTitle}</span>
          <span className="text-white/25 text-xs">•</span>
          <span className="text-white/60 text-sm tabular-nums shrink-0">{formatTime(elapsedSeconds)}</span>
          <span className="text-white/25 text-xs">•</span>
          <span className="text-white/25 text-[11px] font-mono truncate hidden sm:block">
            {sessionId.length > 12 ? `${sessionId.slice(0, 12)}…` : sessionId}
          </span>
        </div>

        {/* Center: controls */}
        <div className="flex items-center gap-1.5 shrink-0">

          {/* ── Microphone + device picker ── */}
          <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup menu */}
            {showAudioMenu && (
              <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#292a2d] border border-white/10 rounded-2xl shadow-2xl py-2 min-w-[256px] z-50 overflow-hidden">
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
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.07]"
                    >
                      <CheckIcon
                        size={14}
                        weight="bold"
                        className={selectedAudioId === d.deviceId ? "text-[#8ab4f8]" : "text-transparent"}
                      />
                      <span className={selectedAudioId === d.deviceId ? "text-[#8ab4f8]" : "text-white/80"}>
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
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                  micOn
                    ? "bg-white/10 hover:bg-white/[0.16] text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {micOn
                  ? <MicrophoneIcon size={20} weight="fill" />
                  : <MicrophoneSlashIcon size={20} weight="fill" />}
              </button>
              <button
                onClick={() => { setShowAudioMenu((v) => !v); setShowVideoMenu(false); }}
                disabled={!connected}
                className="w-[18px] h-[18px] mb-0.5 rounded-full bg-[#3c4043] border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#52565a] transition-colors disabled:opacity-30"
              >
                <CaretUpIcon size={9} weight="bold" />
              </button>
            </div>
          </div>

          {/* ── Camera + device picker ── */}
          {!isVoiceMode && (
            <div
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {showVideoMenu && (
                <div className="absolute bottom-[calc(100%+10px)] left-1/2 -translate-x-1/2 bg-[#292a2d] border border-white/10 rounded-2xl shadow-2xl py-2 min-w-[256px] z-50 overflow-hidden">
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
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/[0.07]"
                      >
                        <CheckIcon
                          size={14}
                          weight="bold"
                          className={selectedVideoId === d.deviceId ? "text-[#8ab4f8]" : "text-transparent"}
                        />
                        <span className={selectedVideoId === d.deviceId ? "text-[#8ab4f8]" : "text-white/80"}>
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40 ${
                    camOn
                      ? "bg-white/10 hover:bg-white/[0.16] text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {camOn
                    ? <VideoCameraIcon size={20} weight="fill" />
                    : <VideoCameraSlashIcon size={20} weight="fill" />}
                </button>
                <button
                  onClick={() => { setShowVideoMenu((v) => !v); setShowAudioMenu(false); }}
                  disabled={!connected}
                  className="w-[18px] h-[18px] mb-0.5 rounded-full bg-[#3c4043] border border-white/15 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#52565a] transition-colors disabled:opacity-30"
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
                : () => { cleanupRoom(); router.replace("/patient/schedule"); }
            }
            disabled={isEnding}
            title={isDoctor ? "End call for everyone" : "Leave call"}
            className="mx-2 w-14 h-12 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-red-900/40"
          >
            {isEnding
              ? <CircleNotchIcon size={20} className="animate-spin text-white" />
              : <PhoneSlashIcon size={20} weight="fill" className="text-white" />}
          </button>
        </div>

        {/* Right: placeholder for future controls */}
        <div className="flex-1 flex justify-end items-center" />
      </div>
    </div>
  );
}
