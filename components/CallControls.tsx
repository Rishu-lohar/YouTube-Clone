"use client";

import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  PhoneOff,
  Circle,
} from "lucide-react";
import { useState } from "react";

export default function CallControls() {
  const [mute, setMute] = useState(false);
  const [camera, setCamera] = useState(true);
  const [recording, setRecording] = useState(false);

  const handleShareScreen = async () => {
    try {
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      alert("Screen sharing started.");
    } catch (err) {
      console.log(err);
      alert("Screen sharing cancelled.");
    }
  };

  return (
    <div className="border rounded-xl p-5 mt-6">

      <h2 className="text-2xl font-bold mb-5">
        📹 Call Controls
      </h2>

      <div className="flex flex-wrap gap-4">

        <button
          onClick={() => setMute(!mute)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          {mute ? <MicOff size={18} /> : <Mic size={18} />}
          {mute ? "Unmute" : "Mute"}
        </button>

        <button
          onClick={() => setCamera(!camera)}
          className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          {camera ? <Video size={18} /> : <VideoOff size={18} />}
          {camera ? "Camera On" : "Camera Off"}
        </button>

        <button
          onClick={handleShareScreen}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          <Monitor size={18} />
          Share Screen
        </button>

        <button
          onClick={() => setRecording(!recording)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          <Circle size={18} />
          {recording ? "Stop Recording" : "Start Recording"}
        </button>

        <button
          onClick={() => {
            alert("Call Ended");
            window.location.href = "/";
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-lg flex items-center gap-2"
        >
          <PhoneOff size={18} />
          Leave Call
        </button>
        
      </div>

    </div>
  );
}