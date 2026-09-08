"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import WatchPartyChat from "@/components/WatchPartyChat";
import CallControls from "@/components/CallControls";
import VideoPlayer from "@/components/VideoPlayer";
import socket from "@/lib/socket";

export default function WatchPartyPage() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const room = searchParams.get("room");

  const [party, setParty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchParty = async () => {
    if (!room) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get(`/watchparty/${room}`);
      setParty(res.data.party);
    } catch (error) {
      console.log(error);
      alert("Unable to load Watch Party");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Party
  useEffect(() => {
    fetchParty();
  }, [room]);


  // Socket Connection
  useEffect(() => {
    if (!room || !user) return;

    socket.connect();

    socket.emit("join-room", {
      roomCode: room,
      userId: user._id,
    });

    socket.on("participant-joined", () => {
      fetchParty(); // Refresh participants
    });

    socket.on("participant-left", () => {
      fetchParty();
    });

    return () => {
      socket.off("participant-joined");
      socket.off("participant-left");
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
      <div className="flex flex-col justify-center items-center h-screen gap-4">
        <h1 className="text-3xl font-bold">
          Watch Party Not Found
        </h1>

        <button
          onClick={() => router.push("/")}
          className="bg-red-600 text-white px-5 py-2 rounded-lg"
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

      socket.disconnect();

      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-8">
        🎬 Watch Party
      </h1>

      <div className="border rounded-xl p-6 space-y-4">

        <div>
          <span className="font-semibold">Room Code :</span>{" "}
          {party.roomCode}
        </div>

        <div>
          <span className="font-semibold">Host :</span>{" "}
          {party.host?.name || party.host}
        </div>

        <div>
          <span className="font-semibold">Participants :</span>{" "}
          {party.participants?.length}
        </div>

        <div>
          <span className="font-semibold">Video :</span>{" "}
          {party.video?.videotitle}
        </div>

        <div>
          <span className="font-semibold">Status :</span> 🟢 Live
        </div>

      </div>

      {party.video && (
        <div className="mt-8">
          <VideoPlayer videoPath={party.video.filepath} />
        </div>
      )}

      <div className="border rounded-xl p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">
          👥 Participants
        </h2>

        {party.participants?.length > 0 ? (
          <div className="space-y-3">
            {party.participants.map((participant: any) => (
              <div
                key={participant._id}
                className="flex items-center justify-between border rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      participant.image ||
                      "https://github.com/shadcn.png"
                    }
                    alt={participant.name}
                    className="w-12 h-12 rounded-full"
                  />

                  <div>
                    <h3 className="font-semibold">
                      {participant.name}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {participant.email}
                    </p>
                  </div>
                </div>

                {participant._id === party.host?._id && (
                  <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                    Host
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No Participants Yet.</p>
        )}
      </div>

      <WatchPartyChat
        roomCode={party.roomCode}
        username={user?.name || "Guest"}
      />



      <div className="mt-8 flex justify-end">
        <button
          onClick={handleLeaveParty}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg"
        >
          🚪 Leave Party
        </button>
      </div>

    </div>
  );
}