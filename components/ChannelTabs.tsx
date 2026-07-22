"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" },
];

export default function ChannelTabs() {
  const [activeTab, setActiveTab] = useState("videos");

  return (
    <div className="border-b px-4">

      <div className="flex gap-8 overflow-x-auto">

        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id)}
            className={`px-0 py-4 border-b-2 rounded-none ${
              activeTab === tab.id
                ? "border-black text-black"
                : "border-transparent text-gray-600 hover:text-black"
            }`}
          >
            {tab.label}
          </Button>
        ))}

      </div>

    </div>
  );
}