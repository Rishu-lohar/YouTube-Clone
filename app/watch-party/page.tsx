"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import WatchPartyChat from "@/components/WatchPartyChat";
import VideoPlayer from "@/components/VideoPlayer";
import socket from "@/lib/socket";

type PartyMember = {
  _id: string;
  name: string;
};

type PartyData = {
  roomCode: string;
  host?: {
    _id: string;
    name: string;
  };
  participants?: PartyMember[];
  video?: {
    filepath: string;
    videotitle: string;
  };
};

const peerConfiguration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function WatchPartyContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const room = searchParams.get("room");

  const [party, setParty] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const cleanupPartyRef = useRef<() => void>(() => {});
  const partyGeneration = useRef(0);

  const stopMedia = () => {
    localStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current?.getTracks().forEach((track) => track.stop());
    peerConnection.current?.close();

    localStream.current = null;
    screenStream.current = null;
    peerConnection.current = null;

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const startLocalStream = async (isActive: () => boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (!isActive()) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createPeerConnection = useCallback(() => {
    const connection = new RTCPeerConnection(peerConfiguration);
    peerConnection.current = connection;
    const stream = localStream.current;

    stream?.getTracks().forEach((track) => {
      connection.addTrack(track, stream);
    });

    connection.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          roomCode: room,
          candidate: event.candidate,
        });
      }
    };
  }, [room]);

  const fetchParty = useCallback(async () => {
    if (!room) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get(`/watchparty/${room}`);
      setParty(res.data.party);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [room]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      fetchParty();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [fetchParty]);

  useEffect(() => {
    if (!room || !user) return;

    const generation = ++partyGeneration.current;
    let active = true;
    let syncTimeout: number | null = null;

    const cleanup = () => {
      active = false;
      if (syncTimeout !== null) window.clearTimeout(syncTimeout);
      window.removeEventListener("pagehide", cleanup);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("video-sync", handleVideoSync);
      socket.off("participant-joined", handleParticipantChange);
      socket.off("participant-left", handleParticipantChange);
      stopMedia();
      socket.disconnect();

      if (partyGeneration.current === generation) {
        partyGeneration.current += 1;
      }
      if (cleanupPartyRef.current === cleanup) {
        cleanupPartyRef.current = () => {};
      }
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
      const connection = peerConnection.current;
      if (!active || !connection) return;

      try {
        await connection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        if (!active || peerConnection.current !== connection) return;

        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        if (!active) return;

        socket.emit("answer", {
          roomCode: room,
          answer,
        });
      } catch (err) {
        console.error("Watch Party offer handling failed:", err);
      }
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
      const connection = peerConnection.current;
      if (!active || !connection) return;

      try {
        await connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (err) {
        console.error("Watch Party answer handling failed:", err);
      }
    };

    const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
      const connection = peerConnection.current;
      if (!active || !connection) return;

      try {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("Watch Party ICE candidate handling failed:", err);
      }
    };

    const handleVideoSync = (data: {
      action: string;
      time?: number;
    }) => {
      const video = document.querySelector(
        "[data-watch-party-video]"
      ) as HTMLVideoElement | null;

      if (!video) return;

      setIsRemoteUpdate(true);

      if (data.action === "play") {
        video.play().catch((err) => console.error(err));
      } else if (data.action === "pause") {
        video.pause();
      } else if (data.action === "seek" && data.time !== undefined) {
        video.currentTime = data.time;
      }

      if (syncTimeout !== null) window.clearTimeout(syncTimeout);
      syncTimeout = window.setTimeout(() => {
        if (active) setIsRemoteUpdate(false);
      }, 100);
    };

    const handleParticipantChange = () => {
      if (active) void fetchParty();
    };

    const init = async () => {
      try {
        socket.connect();
        await startLocalStream(() => active);
        if (!active) return;

        createPeerConnection();

        socket.emit("join-room", {
          roomCode: room,
          userId: user._id,
        });

        if (party?.host?._id === user._id && peerConnection.current) {
          const connection = peerConnection.current;
          const offer = await connection.createOffer();
          await connection.setLocalDescription(offer);
          if (!active) return;

          socket.emit("offer", {
            roomCode: room,
            offer,
          });
        }
      } catch (err) {
        if (active) console.error("Watch Party initialization failed:", err);
      }
    };

    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("video-sync", handleVideoSync);
    socket.on("participant-joined", handleParticipantChange);
    socket.on("participant-left", handleParticipantChange);
    cleanupPartyRef.current = cleanup;
    window.addEventListener("pagehide", cleanup);
    void init();

    return cleanup;
  }, [room, user, party?.host?._id, fetchParty, createPeerConnection]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading Watch Party...
      </div>
    );
  }

  if (!party) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-5">
        <h1 className="text-3xl font-bold">Watch Party Not Found</h1>

        <button
          onClick={() => router.push("/")}
          className="bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    );
  }

  const handleLeaveParty = async () => {
    socket.emit("leave-room", {
      roomCode: room,
      userId: user?._id,
    });
    cleanupPartyRef.current();

    try {
      await axiosInstance.post("/watchparty/leave", {
        roomCode: room,
        userId: user?._id,
      });

      router.push("/");
    } catch (err) {
      console.log(err);
    }
  };

  const startScreenShare = async () => {
    const generation = partyGeneration.current;

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      if (generation !== partyGeneration.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      screenStream.current = stream;
      const screenTrack = stream.getVideoTracks()[0];
      const sender = peerConnection.current
        ?.getSenders()
        .find((s) => s.track?.kind === "video");

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      screenTrack.onended = () => {
        if (!localStream.current) return;

        const cameraTrack = localStream.current.getVideoTracks()[0];
        sender?.replaceTrack(cameraTrack);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }
      };
    } catch (err) {
      console.log(err);
    }
  };

  const toggleMute = () => {
    if (!localStream.current) return;

    const audioTrack = localStream.current.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  };

  const toggleCamera = () => {
    if (!localStream.current) return;

    const videoTrack = localStream.current.getVideoTracks()[0];
    if (!videoTrack) return;

    videoTrack.enabled = !videoTrack.enabled;
    setCameraOff(!videoTrack.enabled);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="text-4xl font-bold mb-6">🎬 Watch Party</h1>

      <div className="border rounded-xl p-6 space-y-4">
        <p>
          <span className="font-semibold">Room :</span>{" "}
          {party.roomCode}
        </p>

        <p>
          <span className="font-semibold">Host :</span>{" "}
          {party.host?.name}
        </p>

        <p>
          <span className="font-semibold">
            Participants ({party.participants?.length || 0})
          </span>
        </p>

        <div className="space-y-2">
          {party.participants?.map((participant: PartyMember) => (
            <div
              key={participant._id}
              className="flex items-center justify-between border rounded-lg px-4 py-2"
            >
              <span>{participant.name}</span>

              {participant._id === party.host?._id && (
                <span className="text-sm font-semibold text-yellow-600">
                  👑 Host
                </span>
              )}
            </div>
          ))}
        </div>

        <p>
          <span className="font-semibold">Video :</span>{" "}
          {party.video?.videotitle}
        </p>
      </div>

      {party.video && (
        <div className="mt-8">
          <VideoPlayer
            videoPath={party.video.filepath}
            onPlay={() =>
              socket.emit("video-sync", {
                roomCode: room,
                action: "play",
              })
            }
            onPause={() =>
              socket.emit("video-sync", {
                roomCode: room,
                action: "pause",
              })
            }
            onSeek={(time) =>
              socket.emit("video-sync", {
                roomCode: room,
                action: "seek",
                time,
              })
            }
            isRemoteUpdate={isRemoteUpdate}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div>
          <h2 className="font-bold mb-3">📷 My Camera</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="rounded-xl bg-black w-full h-72"
          />
        </div>

        <div>
          <h2 className="font-bold mb-3">👥 Remote User</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded-xl bg-black w-full h-72"
          />
        </div>
      </div>

      <div className="mt-8">
        <WatchPartyChat
          roomCode={party.roomCode}
          username={user?.name || "Guest"}
        />
      </div>

      <div className="mt-8 flex flex-col justify-end gap-3 sm:flex-row sm:flex-wrap">
        <button
          onClick={handleLeaveParty}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          🚪 Leave Party
        </button>

        <button
          onClick={startScreenShare}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
        >
          🖥 Share Screen
        </button>

        <button
          onClick={toggleMute}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg"
        >
          {isMuted ? "🎤 Unmute" : "🔇 Mute"}
        </button>

        <button
          onClick={toggleCamera}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
        >
          {cameraOff ? "📷 Camera On" : "📷 Camera Off"}
        </button>
      </div>
    </div>
  );
}

export default function WatchPartyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen text-xl">
          Loading Watch Party...
        </div>
      }
    >
      <WatchPartyContent />
    </Suspense>
  );
}
