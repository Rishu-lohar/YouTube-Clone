"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import WatchPartyChat from "@/components/WatchPartyChat";
import VideoPlayer from "@/components/VideoPlayer";
import socket from "@/lib/socket";

export default function WatchPartyPage() {

  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const room = searchParams.get("room");

  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const screenStream = useRef<MediaStream | null>(null);


  const configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log(err);
    }
  };

  const createPeerConnection = () => {

    peerConnection.current = new RTCPeerConnection(configuration);

    localStream.current?.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, localStream.current!);
    });

    peerConnection.current.ontrack = (event) => {

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }

    };

    peerConnection.current.onicecandidate = (event) => {

      if (event.candidate) {

        socket.emit("ice-candidate", {
          roomCode: room,
          candidate: event.candidate,
        });

      }

    };

  };

  const fetchParty = async () => {

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
  };

  // Fetch Party
  useEffect(() => {
    fetchParty();
  }, [room]);


  // Socket + WebRTC
  useEffect(() => {
    if (!room || !user) return;

    const init = async () => {
      socket.connect();

      await startLocalStream();

      createPeerConnection();

      socket.emit("join-room", {
        roomCode: room,
        userId: user._id,
      });

      // HOST creates offer
      if (party?.host?._id === user._id) {
        const offer = await peerConnection.current!.createOffer();

        await peerConnection.current!.setLocalDescription(offer);

        socket.emit("offer", {
          roomCode: room,
          offer,
        });
      }
    };

    init();


    // Receive Offer
    socket.on("offer", async (offer) => {

      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        roomCode: room,
        answer,
      });
    });

    // Receive Answer
    socket.on("answer", async (answer) => {

      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Receive ICE Candidate
    socket.on("ice-candidate", async (candidate) => {

      if (!peerConnection.current) return;

      try {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.log(err);
      }
    });

    socket.on("participant-joined", fetchParty);

    socket.on("participant-left", fetchParty);

    return () => {

      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("participant-joined");
      socket.off("participant-left");

      // Camera + Mic stop
      localStream.current?.getTracks().forEach(track => track.stop());

      // Screen sharing stop
      screenStream.current?.getTracks().forEach((track) => track.stop());


      peerConnection.current?.close();

      socket.disconnect();
    };

  }, [room, user]);

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
    try {
      socket.emit("leave-room", {
        roomCode: room,
        userId: user?._id,
      });

      await axiosInstance.post("/watchparty/leave", {
        roomCode: room,
        userId: user?._id,
      });

      localStream.current?.getTracks().forEach((track) => track.stop());
      screenStream.current?.getTracks().forEach((track) => track.stop());

      peerConnection.current?.close();

      socket.disconnect();

      router.push("/");
    } catch (err) {
      console.log(err);
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

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
    <div className="max-w-6xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-6">
        🎬 Watch Party
      </h1>

      <div className="border rounded-xl p-6 space-y-3">

        <p>
          <span className="font-semibold">Room :</span>{" "}
          {party.roomCode}
        </p>

        <p>
          <span className="font-semibold">Host :</span>{" "}
          {party.host?.name}
        </p>

        <p>
          <span className="font-semibold">Participants :</span>{" "}
          {party.participants?.length}
        </p>

        <p>
          <span className="font-semibold">Video :</span>{" "}
          {party.video?.videotitle}
        </p>

      </div>

      {party.video && (
        <div className="mt-8">
          <VideoPlayer
            videoPath={party.video.filepath}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <div>

          <h2 className="font-bold mb-3">
            📷 My Camera
          </h2>

          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="rounded-xl bg-black w-full h-72"
          />

        </div>

        <div>

          <h2 className="font-bold mb-3">
            👥 Remote User
          </h2>

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

      <div className="mt-8 flex justify-end gap-3">

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

