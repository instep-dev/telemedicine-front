"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Video, { type Room, type RemoteParticipant, type RemoteTrack } from "twilio-video";
import { toast } from "react-toastify";
import { ShareIcon, MicrophoneIcon, MicrophoneSlashIcon, PhoneXIcon, VideoCameraIcon, VideoCameraSlashIcon, SealCheckIcon, CircleNotchIcon, CheckIcon, ArrowsOutSimpleIcon, ArrowsOutIcon, UserIcon, LinkSimpleHorizontalIcon, DotsThreeIcon, DotsThreeVerticalIcon, Record, RecordIcon, UserPlus, UserPlusIcon } from "@phosphor-icons/react";
import { authStore } from "@/services/auth/auth.store";
import { twilioApi } from "@/services/twillio/twilio.api";
import {
  useDoctorTokenMutation,
  useEndCallMutation,
} from "@/services/twillio/twilio.queries";
import { useConsultationStore } from "@/services/consultations/consultations.store";
import { getInitials } from "@/hooks/useInitials";

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
  const [isLoading, setIsLoading] = useState(false)
  const [isLocalFullscreen, setIsLocalFullscreen] = useState(false);

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  const audioElsRef = useRef<HTMLElement[]>([]);
  const isCleaningRef = useRef(false);
  const hasStartedRef = useRef(false);
  const transcriptionBufferRef = useRef<string[]>([]);
  const transcriptionFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  async function flushTranscriptions() {
    const accessTokenValue = accessToken;
    if (!accessTokenValue || !consultationId) return;

    const buffer = transcriptionBufferRef.current;
    if (!buffer.length) return;

    transcriptionBufferRef.current = [];

    try {
      await twilioApi.sendTranscription(accessTokenValue, {
        consultationId,
        transcription: buffer.join("\n"),
      });
    } catch {
      // ignore: transcription retry best-effort
    }
  }

  function scheduleTranscriptionFlush() {
    if (transcriptionFlushTimerRef.current) return;
    transcriptionFlushTimerRef.current = setTimeout(() => {
      transcriptionFlushTimerRef.current = null;
      void flushTranscriptions();
    }, 1500);
  }

  function handleTranscriptionEvent(event: any) {
    if (!event) return;

    const isFinalFlag =
      event?.isFinal ??
      event?.final ??
      event?.transcription?.isFinal ??
      event?.transcription?.final;
    if (isFinalFlag === false) return;

    const type = event?.type ?? event?.transcription?.type;
    if (typeof type === "string" && type.toLowerCase() === "partial") return;

    let text = "";
    if (typeof event?.transcription === "string") {
      text = event.transcription;
    } else if (event?.transcription) {
      text =
        event.transcription.transcription ??
        event.transcription.text ??
        event.transcription.transcript ??
        "";
    } else {
      text = event?.text ?? event?.transcript ?? "";
    }

    text = String(text).trim();
    if (!text) return;

    transcriptionBufferRef.current.push(text);
    scheduleTranscriptionFlush();
  }

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

    participant.tracks.forEach((pub: any) => {
      if (isCleaningRef.current) return;
      if (pub.isSubscribed && pub.track) {
        const t: any = pub.track as RemoteTrack;

        if (t.kind === "video") {
          if (!remoteRef.current) return;
          attachRemoteVideo(t, remoteRef.current);
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
        receiveTranscriptions: true,
      });

      roomRef.current = room;
      setConnected(true);
      setMicOn(true);
      setCamOn(true);

      attachLocalVideo(room);

      room.on("transcription", handleTranscriptionEvent);
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
      await flushTranscriptions();
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
    <main className="flex flex-col justify-between bg-gray-100 h-screen w-full">
      <div className="flex items-center justify-between bg-white h-24 border-b border-gray-200">
        <div className="w-full h-full flex items-center justify-between">
          <div className="flex items-center gap-x-6 h-full">
            <div className="border-r border-gray-200 h-full flex items-center gap-x-2">
              <div className="px-6">
                <VideoCameraIcon size={32} className="text-primary" weight="fill"/>
              </div>
            </div>
            <div>
              <h3 className=" font-medium">[Consultation] roomID-skjl-kolj</h3>
              <p className="text-xs text-gray-400">Sunday, 5 April 2026 | 11.00 AM</p>
            </div>
          </div>
          <div className="h-full flex items-center ">
            <div className="pr-6">
              <button
                type="button"
                onClick={copyLink}
                className="border h-8 rounded-full flex items-center py-2 px-3 gap-2 bg-primary/10 text-primary border-primary/20 font-medium"
              >
                <LinkSimpleHorizontalIcon className="text-base" weight="bold"/>
                <div className="w-[1.5px] h-3 bg-primary"/>
                <p className="text-xs">Copy link</p>
              </button>
            </div>
          </div>
        </div>
        <div className="w-96 h-full border-gray-200 flex items-center">
          <div className="px-6 w-full flex items-center justify-center">
            <button className="w-full rounded-full bg-gray-50 border border-gray-200 flex items-center justify-between py-2 px-3  ">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/10 flex items-center justify-center text-xs font-medium">
                  {getInitials('fadlan daris')}
                </div>
                <div>
                  <h3 className="text-xs font-medium capitalize">Fadlan Daris</h3>
                  <p className="text-xs text-gray-400 text-left">Patient</p>
                </div>
              </div>
              <DotsThreeVerticalIcon weight="bold"/>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between w-full h-full">
        <div className="w-full h-full">
          <div className="w-full h-full p-6 grid grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border bg-white flex flex-col">
              <div className="px-4 py-3 border-b text-sm font-medium">Patient</div>
              <div className="w-full flex-1 bg-black">
                <div ref={remoteRef} className="w-full h-full" />
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border bg-white flex flex-col">
              <div className="px-4 py-3 border-b text-sm font-medium">You</div>
              <div className="w-full flex-1 bg-black">
                <div ref={localRef} className="w-full h-full" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-96 h-full bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200 text-sm bg-white flex items-center justify-between">
            <p className="font-medium">Participant</p>
            <button
              type="button"
              onClick={copyLink}
              className="border px-3 py-1 rounded-full flex items-center  gap-1 bg-primary/10 text-primary border-primary/20 font-medium"
            >
              <p className="text-xs">Add Participant</p>
              <UserPlusIcon className="text-sm" weight="bold"/>
            </button>
          </div>
          <div className="px-3 pt-6 bg-gray-100 w-full h-full flex flex-col gap-4 text-sm">
            <div className="rounded-full bg-white border border-gray-200 w-full px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full text-success-500 border-success-100 border bg-success-50 flex items-center justify-center text-xs font-medium">
                  {getInitials('You')}
                </div>
                <div className="font-medium text-xs flex items-center gap-1">Dr. Test Satu<SealCheckIcon className="text-success-400" weight="fill"/></div>
              </div>
              <div className="flex items-center gap-2">
                <MicrophoneIcon size={16} className="text-primary"/>
                <VideoCameraSlashIcon size={16} className="text-red-500"/>
              </div>
            </div>

            <div className="rounded-full bg-white border border-gray-200 w-full px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/10 flex items-center justify-center text-xs font-medium">
                  {getInitials('Fadlan Daris')}
                </div>
                <p className="font-medium text-xs">Fadlan Daris</p>
              </div>
              <div className="flex items-center gap-2">
                <MicrophoneIcon size={16} className="text-primary"/>
                <VideoCameraSlashIcon size={16} className="text-red-500"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white h-24 border-t border-gray-200">
        <div className="w-full h-full flex items-center">
          <div className="px-6 w-full flex items-center justify-between">
            <div className=" w-full flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={toggleMic}
                disabled={!connected || isEndingCall}
                className="flex items-center justify-center w-10 h-10 rounded-full  bg-primary disabled:opacity-50"
              >
                <MicrophoneIcon size={16} weight="bold" className="text-white"/>
              </button>
              <button
                type="button"
                onClick={toggleCam}
                disabled={!connected || isEndingCall}
                className="flex items-center justify-center w-10 h-10 rounded-full  bg-primary disabled:opacity-50"
              >
                <VideoCameraIcon size={16} weight="bold" className="text-white"/>
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center justify-center w-10 h-10 rounded-full  bg-primary/10 text-primary"
              >
                <LinkSimpleHorizontalIcon size={16} weight="bold" />
              </button>
              <button className="flex items-center justify-center w-10 h-10 rounded-full  bg-red-500/10">
                <RecordIcon size={16} weight="fill" className="text-red-500 animate-ping"/>
              </button>
            </div>
            <div className="">
              <button
                type="button"
                onClick={endCall}
                disabled={isEndingCall}
                className="w-28 text-sm h-9 rounded-full bg-red-500 text-white font-medium disabled:opacity-50"
              >
                End call
              </button>
            </div>
          </div>
        </div>
        <div className="w-96 h-full border-l border-t border-gray-200">
          chat
        </div>
      </div>
    </main>
  );
}
