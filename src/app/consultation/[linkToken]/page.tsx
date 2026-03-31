"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Video, { type Room, type RemoteParticipant, type RemoteTrack } from "twilio-video";

import { useConsultationLinkQuery } from "@/services/consultations/consultations.queries";
import { useGuestTokenMutation } from "@/services/twillio/twilio.queries";

export default function MeetPage() {
  const params = useParams<{ linkToken: string }>();
  const linkToken = params?.linkToken;

  const linkQuery = useConsultationLinkQuery(linkToken);
  const guestTokenMutation = useGuestTokenMutation();

  const info = linkQuery.data;

  const [displayName, setDisplayName] = useState("");
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);

  const roomRef = useRef<Room | null>(null);
  const localRef = useRef<HTMLDivElement | null>(null);
  const remoteRef = useRef<HTMLDivElement | null>(null);

  // audio element yang kita attach ke body (hidden)
  const audioElsRef = useRef<HTMLElement[]>([]);
  const isCleaningRef = useRef(false);

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
        // matikan listener biar ga ada callback yang ngubah DOM saat cleanup
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

  useEffect(() => {
    return () => cleanupRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;

    async function loadIp() {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        if (!res.ok) return;
        const data = await res.json();
        const ip = typeof data?.ip === "string" ? data.ip : null;
        if (active && ip) setClientIp(ip);
      } catch {
        // ignore: optional in dev
      }
    }

    loadIp();

    return () => {
      active = false;
    };
  }, []);

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

    // attach existing tracks
    participant.tracks.forEach((pub: any) => {
      if (isCleaningRef.current) return;
      if (pub.isSubscribed && pub.track) {
        const track: any = pub.track as RemoteTrack;

        if (track.kind === "video") {
          if (!remoteRef.current) return;
          remoteRef.current.innerHTML = "";
          attachTrackToContainer(track, remoteRef.current);
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

      // jangan detach, cukup clear video
      if (t.kind === "video") {
        if (remoteRef.current) remoteRef.current.innerHTML = "";
      }
    });
  }

  async function onJoin() {
    setErrMsg(null);

    if (!linkToken) return;
    if (!displayName.trim()) {
      setErrMsg("Masukkan nama kamu dulu.");
      return;
    }

    cleanupRoom();

    try {
      const tokenData = await guestTokenMutation.mutateAsync({
        linkToken,
        displayName: displayName.trim(),
        clientIp: clientIp ?? undefined,
      });

      const room = await Video.connect(tokenData.token, {
        name: tokenData.roomName,
        audio: true,
        video: true,
      });

      roomRef.current = room;
      setConnected(true);

      attachLocalVideo(room);

      // attach remote participants existing
      room.participants.forEach((p) => handleRemoteParticipant(p));

      room.on("participantConnected", (p) => handleRemoteParticipant(p));

      room.on("participantDisconnected", () => {
        if (remoteRef.current) remoteRef.current.innerHTML = "";
      });

      room.on("disconnected", () => {
        cleanupRoom();
      });
    } catch (err: any) {
      setErrMsg(err?.response?.data?.message ?? err?.message ?? "Failed to join call");
      cleanupRoom();
    }
  }

  function onDisconnect() {
    cleanupRoom();
  }

  const disabledJoin =
    connected || guestTokenMutation.isPending || linkQuery.isLoading || linkQuery.isError;

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      {/* Info */}
      <div className="rounded-xl border bg-white p-4 space-y-2">
        <h1 className="text-xl font-semibold">Consultation Room</h1>

        {linkQuery.isLoading && <p className="text-sm text-gray-500">Loading consultation...</p>}

        {linkQuery.isError && (
          <p className="text-sm text-red-600">
            Link invalid/expired atau konsultasi sudah tidak tersedia.
          </p>
        )}

        {info && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-gray-500 text-xs">Doctor</div>
              <div className="font-medium">{info.doctorName}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-gray-500 text-xs">Status</div>
              <div className="font-medium">{info.status}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-gray-500 text-xs">Access</div>
              <div className="font-medium">
                Active while consultation is ongoing
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join */}
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nama kamu"
            disabled={connected}
            maxLength={50}
            className="w-full md:w-80 px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50"
          />

          <button
            onClick={onJoin}
            disabled={disabledJoin}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black disabled:opacity-60"
          >
            {guestTokenMutation.isPending ? "Joining..." : connected ? "Joined" : "Join"}
          </button>

          <button
            onClick={onDisconnect}
            disabled={!connected}
            className="px-4 py-2 rounded-lg border border-gray-900 hover:bg-gray-900 hover:text-white disabled:opacity-60"
          >
            Disconnect
          </button>
        </div>

        {errMsg && <div className="text-sm text-red-600">{errMsg}</div>}

        <p className="text-xs text-gray-500">
          1 pasien per link. Jika refresh, backend akan menjaga identity deterministik dari linkToken.
        </p>
      </div>

      {/* Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Local Video</h2>
            <span className={`text-xs ${connected ? "text-green-600" : "text-gray-400"}`}>
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>

          {/* PENTING: ref div harus kosong. placeholder overlay */}
          <div className="relative mt-3 w-full min-h-[260px] rounded-lg bg-gray-50 overflow-hidden">
            <div ref={localRef} className="absolute inset-0" />
            {!connected && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Not connected
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <h2 className="font-semibold">Doctor Video</h2>

          <div className="relative mt-3 w-full min-h-[260px] rounded-lg bg-gray-50 overflow-hidden">
            <div ref={remoteRef} className="absolute inset-0" />
            {!connected && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                Waiting participant…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
