"use client";

import { useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";

export default function WatchPartyPage() {
  const { user } = useUser();

  const [roomCode, setRoomCode] = useState("");
  const [party, setParty] = useState<any>(null);

  const handleCreateParty = async () => {
    try {
      const res = await axiosInstance.post("/watchparty/create", {
        hostId: user?._id,
        videoId: "YOUR_VIDEO_ID", // baad me actual video id denge
      });

      setParty(res.data.party);
      setRoomCode(res.data.party.roomCode);

      alert("Watch Party Created!");
    } catch (err) {
      console.log(err);
      alert("Failed to create party");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded-lg space-y-6">

      <h1 className="text-3xl font-bold">
        🎬 Watch Party
      </h1>

      <button
        onClick={handleCreateParty}
        className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
      >
        Create Party
      </button>

      {party && (
        <div className="border rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">
            Party Created Successfully
          </h2>

          <p>
            <strong>Room Code:</strong> {roomCode}
          </p>

          <p>
            <strong>Host:</strong> {party.host}
          </p>

          <p>
            <strong>Participants:</strong>{" "}
            {party.participants.length}
          </p>
        </div>
      )}

    </div>
  );
}