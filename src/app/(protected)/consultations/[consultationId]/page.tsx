"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Video, { type Room, type RemoteParticipant, type RemoteTrack } from "twilio-video";
import { toast } from "react-toastify";
import { ChatCenteredDotsIcon, GearSixIcon, MicrophoneIcon, MicrophoneSlashIcon, PhoneXIcon, UsersThreeIcon, VideoCameraIcon, VideoCameraSlashIcon } from "@phosphor-icons/react";
import { authStore } from "@/services/auth/auth.store";
import {
  useDoctorTokenMutation,
  useEndCallMutation,
} from "@/services/twillio/twilio.queries";
import { useConsultationStore } from "@/services/consultations/consultations.store";

// fix test
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
    <div className="min-h-[100dvh] w-full bg-slate-100 p-4">
      <div className="flex h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-theme-xl">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 text-sm font-semibold">
              DR
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">Consultation</span>
              <span className="text-sm font-semibold text-slate-900">
                Room {activeConsultation?.roomName ?? "-"}
              </span>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500"># Dashboard v2</div>

          <div className="flex items-center gap-2">
            {connected && (
              <div className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Recording
              </div>
            )}
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
              <GearSixIcon className="h-4 w-4" />
            </button>
            <button
              onClick={leaveToSummary}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 bg-slate-50 p-4">
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
            <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-theme-xs">
                  <div ref={remoteRef} className="absolute inset-0" />
                  <div className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-600">
                    Remote
                  </div>
                  {!connected && (
                    <div className="absolute inset-0 grid place-items-center text-slate-400">
                      Connecting...
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                    Patient
                  </div>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-theme-xs">
                  <div ref={localRef} className="absolute inset-0" />
                  <div className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-600">
                    You
                  </div>
                  {!connected && (
                    <div className="absolute inset-0 grid place-items-center text-slate-400">
                      Starting camera...
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                    You
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 shadow-theme-xs">
                <div className="text-xs text-slate-500">
                  Consultation ? {activeConsultation?.roomName ?? "-"}
                </div>

                <div className="flex items-center gap-2">
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
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Participants"
                  >
                    <UsersThreeIcon className="h-5 w-5" />
                  </button>

                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    aria-label="Chat"
                  >
                    <ChatCenteredDotsIcon className="h-5 w-5" />
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

                <div className="text-xs text-slate-500">
                  {connected ? "Live" : "Connecting"}
                </div>
              </div>
            </section>

            <aside className="flex flex-col rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 className="text-sm font-semibold text-slate-800">Participants</h3>
                <button className="text-slate-400 hover:text-slate-600">x</button>
              </div>

              <div className="flex-1 space-y-3 px-4 py-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <span className="text-slate-700">You</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MicrophoneIcon className="h-4 w-4" />
                    <VideoCameraIcon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-700">Patient</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <MicrophoneSlashIcon className="h-4 w-4" />
                    <VideoCameraSlashIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
                <button className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                  Invite People
                </button>
                <button
                  onClick={copyLink}
                  disabled={!patientUrl}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Copy Link
                </button>
              </div>
            </aside>
          </div>

          {errMsg && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}