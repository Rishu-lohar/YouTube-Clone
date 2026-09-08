"use client";

import { useEffect, useState } from "react";
import socket from "@/lib/socket";

interface Props {
  roomCode: string;
  username: string;
}

interface Message {
  sender: string;
  text: string;
}

export default function WatchPartyChat({
  roomCode,
  username,
}: Props) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "Host",
      text: "Welcome to the Watch Party 🎉",
    },
  ]);

  useEffect(() => {
    socket.on("receive-message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;

    socket.emit("send-message", {
      roomCode,
      sender: username,
      text: message,
    });

    setMessage("");
  };

  return (
    <div className="border rounded-xl p-5 mt-6">

      <h2 className="text-2xl font-bold mb-4">
        💬 Live Chat
      </h2>

      <div className="h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-900">

        {messages.map((msg, index) => (
          <div
            key={index}
            className="mb-3"
          >
            <span className="font-semibold">
              {msg.sender} :
            </span>{" "}
            {msg.text}
          </div>
        ))}

      </div>

      <div className="flex gap-3 mt-4">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 border rounded-lg px-4 py-2"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg"
        >
          Send
        </button>

      </div>

    </div>
  );
}