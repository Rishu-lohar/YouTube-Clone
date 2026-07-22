"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, X, ThumbsUp, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Ek liked video ka structure
type LikedVideo = {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  views: number;
  videoPath: string;
};

export default function LikedContent() {

  // Liked videos ki list
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([
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

  // Liked videos se video remove karega
  const handleUnlikeVideo = (likedVideoId: string) => {
    setLikedVideos(
      likedVideos.filter((item) => item.id !== likedVideoId)
    );
  };

  // Agar koi liked video nahi hai
  if (likedVideos.length === 0) {
    return (
      <div className="text-center py-12">

        <ThumbsUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />

        <h2 className="text-xl font-semibold mb-2">
          No liked videos yet
        </h2>

        <p className="text-gray-600">
          Videos you like will appear here.
        </p>

      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Top Section */}
      <div className="flex justify-between items-center">

        <p className="text-sm text-gray-600">
          {likedVideos.length} videos
        </p>

        <Button className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Play all
        </Button>

      </div>

      {/* Liked Videos List */}
      <div className="space-y-4">

        {likedVideos.map((item) => (

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
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600 mb-1">
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

            {/* More Options */}
            <DropdownMenu>

              <DropdownMenuTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-100"
              >
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">

                <DropdownMenuItem
                  onClick={() => handleUnlikeVideo(item.id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from liked videos
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </div>

        ))}

      </div>

    </div>
  );
}