"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MoreVertical, X } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// History ke ek video ka structure
type HistoryItem = {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  views: number;
  videoPath: string;
};

export default function HistoryContent() {
  // History videos ko state me store kar rahe hain
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: "1",
      videoId: "1",
      title: "My First YouTube Clone Video",
      channel: "Rishu Channel",
      views: 45000,
      videoPath: "/videos/demo.mp4",
    },
    {
      id: "2",
      videoId: "2",
      title: "Amazing Nature Documentary",
      channel: "Nature Channel",
      views: 23000,
      videoPath: "/videos/demo.mp4",
    },
  ]);

  // History se particular video remove karega
  const handleRemoveFromHistory = (historyId: string) => {
    setHistory(
      history.filter((item) => item.id !== historyId)
    );
  };

  // Agar history me koi video nahi hai
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />

        <h2 className="text-xl font-semibold mb-2">
          No watch history yet
        </h2>

        <p className="text-gray-600">
          Videos you watch will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Total History Videos */}
      <p className="text-sm text-gray-600">
        {history.length} videos
      </p>

      {/* History Videos List */}
      <div className="space-y-4">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 group"
          >

            {/* Video Preview */}
            <Link
              href={`/watch/${item.videoId}`}
              className="shrink-0"
            >
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden">

                <video
                  src={item.videoPath}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

              </div>
            </Link>

            {/* Video Information */}
            <div className="flex-1 min-w-0">

              <Link href={`/watch/${item.videoId}`}>
                <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-600">
                  {item.title}
                </h3>
              </Link>

              <p className="text-sm text-gray-600">
                {item.channel}
              </p>

              <p className="text-sm text-gray-600">
                {item.views.toLocaleString()} views
              </p>

            </div>

            {/* Three Dots Dropdown Menu */}
            <DropdownMenu>

              {/* 
                Trigger khud button generate karta hai,
                isliye iske andar shadcn Button nahi lagayenge.
              */}
              <DropdownMenuTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">

                <DropdownMenuItem
                  onClick={() =>
                    handleRemoveFromHistory(item.id)
                  }
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from watch history
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </div>
        ))}
      </div>

    </div>
  );
}