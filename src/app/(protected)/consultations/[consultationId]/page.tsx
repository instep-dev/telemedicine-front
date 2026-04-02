"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Video, { type Room, type RemoteParticipant, type RemoteTrack } from "twilio-video";
import { toast } from "react-toastify";
import { ShareIcon, MicrophoneIcon, MicrophoneSlashIcon, PhoneXIcon, VideoCameraIcon, VideoCameraSlashIcon, SealCheckIcon, CircleNotchIcon, CheckIcon, ArrowsOutSimpleIcon, ArrowsOutIcon, UserIcon } from "@phosphor-icons/react";
import { motion, type Transition } from "framer-motion";
import { authStore } from "@/services/auth/auth.store";
import {
  useDoctorTokenMutation,
  useEndCallMutation,
} from "@/services/twillio/twilio.queries";
import { useConsultationStore } from "@/services/consultations/consultations.store";
import Badge from "@/components/dashboard/ui/badge/Badge";


export default function DoctorCallPage() {
  const router = useRouter();
  const params = useParams<{ consultationId: string }>();
  const consultationId = params?.consultationId ? String(params.consultationId) : "";

  const accessToken = authStore((s: any) => s.accessToken);
  const doctorTokenMutation = useDoctorTokenMutation(accessToken);
  const endCallMutation = useEndCallMutation(accessToken);

  const activeConsultation = useConsultationStore((s) => s.activeConsultation);
  const setActiveConsultation = useConsultationStore((s) => s.setActiveConsultation);

  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);
  const showSkeleton = !connected && !errMsg;
  const remoteIsPip = isLocalFullscreen;
  const localIsPip = !isLocalFullscreen;
  const fullscreenClass = "absolute inset-0 z-0 w-full h-full overflow-hidden bg-white";
  const pipClass = `absolute z-20 w-96 h-72 bottom-8 right-8 overflow-hidden rounded-3xl ${
    connected ? "" : "border"
  }`;
  const layoutTransition: Transition = {
    type: "spring",
    stiffness: 260,
    damping: 28,
    mass: 0.9,
  };

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  const audioElsRef = useRef<HTMLElement[]>([]);
  const isCleaningRef = useRef(false);
  const hasStartedRef = useRef(false);

  const patientUrl = useMemo(() => {
    if (!activeConsultation) return null;
    if (String(activeConsultation.id) !== String(consultationId)) return null;
    return activeConsultation.url;
  }, [activeConsultation, consultationId]);

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
      try {
        track?.stop?.();
      } catch {}
    });
  }

  function cleanupRoom() {
    if (isCleaningRef.current) return;
    isCleaningRef.current = true;

    const room = roomRef.current;
    roomRef.current = null;

    try {
      if (room) {
        try {
          room.removeAllListeners();
        } catch {}

        try {
          room.participants.forEach((p) => {
            try {
              p.removeAllListeners();
            } catch {}
          });
        } catch {}

        try {
          stopLocalTracks(room);
        } catch {}

        try {
          if ((room as any).state !== "disconnected") room.disconnect();
        } catch {}
      }
    } finally {
      clearContainers();
      clearAudioEls();
      setConnected(false);
      isCleaningRef.current = false;
    }
  }

  function attachTrackToContainer(track: any, container: HTMLElement) {
    const el: HTMLElement = track.attach();
    (el as any).style.width = "100%";
    (el as any).style.height = "100%";
    (el as any).style.objectFit = "cover";
    container.appendChild(el);
  }

  function attachLocalVideo(room: Room) {
    if (!localRef.current) return;
    localRef.current.innerHTML = "";

    room.localParticipant.tracks.forEach((pub) => {
      const track: any = pub.track;
      if (track && track.kind === "video") {
        attachTrackToContainer(track, localRef.current!);
      }
    });
  }

  function handleRemoteParticipant(participant: RemoteParticipant) {
    if (isCleaningRef.current) return;

    participant.tracks.forEach((pub: any) => {
      if (isCleaningRef.current) return;
      if (pub.isSubscribed && pub.track) {
        const t: any = pub.track as RemoteTrack;

        if (t.kind === "video") {
          if (!remoteRef.current) return;
          remoteRef.current.innerHTML = "";
          attachTrackToContainer(t, remoteRef.current);
        } else if (t.kind === "audio") {
          const audioEl = t.attach();
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
        remoteRef.current.innerHTML = "";
        attachTrackToContainer(t, remoteRef.current);
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
      if (t.kind === "video") {
        if (remoteRef.current) remoteRef.current.innerHTML = "";
      }
    });
  }

  async function connectDoctor() {
    if (!consultationId) return;
    if (isCleaningRef.current) return;
    if (roomRef.current) return;
    if (doctorTokenMutation.isPending) return;

    setErrMsg(null);

    try {
      const tokenData = await doctorTokenMutation.mutateAsync({
        consultationId,
      });

      const room = await Video.connect(tokenData.token, {
        name: tokenData.roomName,
        audio: true,
        video: true,
      });

      roomRef.current = room;
      setConnected(true);
      setMicOn(true);
      setCamOn(true);

      attachLocalVideo(room);

      room.participants.forEach((p) => handleRemoteParticipant(p));
      room.on("participantConnected", (p) => handleRemoteParticipant(p));
      room.on("participantDisconnected", () => {
        if (remoteRef.current) remoteRef.current.innerHTML = "";
      });
      room.on("disconnected", () => cleanupRoom());
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to start call");
      cleanupRoom();
    }
  }

  useEffect(() => {
    if (!consultationId) return;
    if (hasStartedRef.current) return;

    hasStartedRef.current = true;
    cleanupRoom();
    connectDoctor();

    return () => {
      cleanupRoom();
      hasStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]);

  function toggleMic() {
    const room = roomRef.current;
    if (!room) return;

    const next = !micOn;
    room.localParticipant.audioTracks.forEach((pub: any) => {
      const track: any = pub.track;
      try {
        next ? track.enable() : track.disable();
      } catch {}
    });
    setMicOn(next);
  }

  function toggleCam() {
    const room = roomRef.current;
    if (!room) return;

    const next = !camOn;
    room.localParticipant.videoTracks.forEach((pub: any) => {
      const track: any = pub.track;
      try {
        next ? track.enable() : track.disable();
      } catch {}
    });
    setCamOn(next);
  }

  function toggleLayout() {
    setIsLocalFullscreen((v) => !v);
  }

  async function endCall() {
    if (!consultationId || !accessToken || endCallMutation.isPending || isEndingCall) return;

    setErrMsg(null);
    setIsEndingCall(true);

    try {
      await endCallMutation.mutateAsync(consultationId);

      cleanupRoom();
      hasStartedRef.current = false;
      setActiveConsultation(null);

      toast.info("Call ended. AI summary sedang diproses di background.");

      router.replace("/ai-summary");
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to end call");
      setIsEndingCall(false);
    }
  }

  function leaveToSummary() {
    setActiveConsultation(null);
    cleanupRoom();
    router.replace("/ai-summary");
  }

  async function copyLink() {
    if (!patientUrl) return;
    try {
      await navigator.clipboard.writeText(patientUrl);
      toast.success("Patient link copied");
    } catch {
      toast.error("Failed to copy patient link");
    }
  }


  return (
    <div className="h-screen w-full relative ">        
      <motion.div
        layout
        transition={layoutTransition}
        className={remoteIsPip ? pipClass : fullscreenClass}
        style={{
          originX: remoteIsPip ? 1 : 0.5,
          originY: remoteIsPip ? 1 : 0.5,
          borderRadius: remoteIsPip ? 24 : 0,
        }}
      >
        <div
          ref={remoteRef}
          className={`absolute inset-0 ${showSkeleton ? "opacity-0" : ""} ${remoteIsPip ? "rounded-3xl" : ""}`}
        />
        {showSkeleton && (
          <>
            <div
              className={`absolute inset-0 ${remoteIsPip ? "rounded-3xl" : ""} bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 animate-pulse`}
            />
            <div
              className={`absolute ${remoteIsPip ? "left-4 top-4 h-6 w-28" : "left-8 top-8 h-7 w-32"} rounded-full bg-slate-200/80 animate-pulse`}
            />
            <div
              className={`absolute ${remoteIsPip ? "left-4 bottom-4 h-6 w-16" : "left-8 bottom-8 h-6 w-20"} rounded-full bg-slate-200/80 animate-pulse`}
            />
          </>
        )}
        {!showSkeleton && (
          <>
            <div
              className={`absolute ${remoteIsPip ? "left-4 top-4 text-xs" : "left-8 top-8 text-sm"} rounded-full bg-white/10 backdrop-blur-xl px-3 py-2 text-white flex items-center gap-1`}
            >
              <UserIcon className="text-sm" weight="fill"/>
              Patient name
            </div>
            <div
              className={`absolute ${remoteIsPip ? "left-4 bottom-4" : "left-8 bottom-8"} rounded-full bg-white/10 backdrop-blur-xl px-3 py-2 text-xs text-white`}
            >
              Patient
            </div>
          </>
        )}
      </motion.div>

      <div className="text-xs absolute top-8 right-8 text-slate-500 z-30">
        {showSkeleton ? (
          <div className="h-7 w-28 rounded-full bg-slate-200/80 animate-pulse" />
        ) : connected ? (
          <Badge className="flex items-center gap-1" color="success">
            <CheckIcon weight="bold" className=" text-xs text-success"/>
            Connected
          </Badge>
        ) : (
          <Badge className="flex items-center gap-1" color="warning">
            <CircleNotchIcon className="animate-spin text-xs text-success"/>
            Connecting
          </Badge>
        )}
      </div>

      <motion.div
        layout
        transition={layoutTransition}
        className={localIsPip ? pipClass : fullscreenClass}
        style={{
          originX: localIsPip ? 1 : 0.5,
          originY: localIsPip ? 1 : 0.5,
          borderRadius: localIsPip ? 24 : 0,
        }}
      >
        <div
          ref={localRef}
          className={`absolute inset-0 ${showSkeleton ? "opacity-0" : ""} ${localIsPip ? "rounded-3xl" : ""}`}
        />
        {showSkeleton && (
          <>
            <div
              className={`absolute inset-0 ${localIsPip ? "rounded-3xl" : ""} bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 animate-pulse`}
            />
            <div
              className={`absolute ${localIsPip ? "left-4 top-4 h-6 w-28" : "left-8 top-8 h-7 w-32"} rounded-full bg-slate-200/80 animate-pulse`}
            />
            <div
              className={`absolute ${localIsPip ? "left-4 bottom-4 h-6 w-16" : "left-8 bottom-8 h-6 w-20"} rounded-full bg-slate-200/80 animate-pulse`}
            />
          </>
        )}
        {!showSkeleton && (
          <>
            <div
              className={`absolute ${localIsPip ? "left-4 top-4 text-xs" : "left-8 top-8 text-sm"} rounded-full bg-white/10 backdrop-blur-xl px-3 py-2 text-white flex items-center gap-1`}
            >
              <SealCheckIcon className="text-sm text-green-400" weight="fill"/>
              Dr. Test Satu
            </div>
            <div
              className={`absolute ${localIsPip ? "left-4 bottom-4" : "left-8 bottom-8"} rounded-full bg-white/10 backdrop-blur-xl px-3 py-2 text-xs text-white`}
            >
              You
            </div>
          </>
        )}
      </motion.div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-between gap-4 rounded-full bg-white/10 backdrop-blur-xl px-6 py-3 shadow-theme-xs">
        {showSkeleton ? (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
            <div className="h-10 w-10 rounded-full bg-slate-200/80 animate-pulse" />
          </div>
        ) : (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLayout}
              disabled={!connected || isEndingCall}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                isLocalFullscreen
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              } disabled:opacity-50`}
              aria-label="Toggle layout"
            >
              {isLocalFullscreen ? (
                <ArrowsOutSimpleIcon className="h-5 w-5 rotate-90" />
              ) : (
                <ArrowsOutIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleMic}
              disabled={!connected || isEndingCall}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                micOn
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              } disabled:opacity-50`}
              aria-label="Toggle microphone"
            >
              {micOn ? (
                <MicrophoneIcon className="h-5 w-5" />
              ) : (
                <MicrophoneSlashIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={toggleCam}
              disabled={!connected || isEndingCall}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
                camOn
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              } disabled:opacity-50`}
              aria-label="Toggle camera"
            >
              {camOn ? (
                <VideoCameraIcon className="h-5 w-5" />
              ) : (
                <VideoCameraSlashIcon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={copyLink}
              disabled={!patientUrl}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              <ShareIcon/>
            </button>

            <button
              onClick={endCall}
              disabled={isEndingCall}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              aria-label="End call"
            >
              <PhoneXIcon className="h-5 w-5" />
            </button>
          </div>
        </>
        )}
      </div>

          {errMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errMsg}
            </div>
          )}
    </div>
  );
}
