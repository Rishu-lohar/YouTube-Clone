"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Crown } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { getVideoSrc } from "@/lib/videoSrc";
import VideoThumbnail from "./VideoThumbnail";

interface VideoCardProps {
  video: {
    _id: string;
    filepath: string;
    videotitle: string;
    videochanel: string;
    views?: number;
    createdAt?: string;
    isPremium?: boolean;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  const videoSrc = getVideoSrc(video?.filepath);

  return (
    <Link href={`/watch/${video?._id}`} className="group">
      <div className="space-y-3">

        {/* Thumbnail */}
        <div className="relative">
          <VideoThumbnail
            src={videoSrc}
            className="aspect-video h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />

          {video?.isPremium && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-white shadow">
              <Crown className="h-3 w-3" />
              Premium
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback>
              {video?.videochanel?.charAt(0) || "Y"}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium group-hover:text-blue-600">
              {video?.videotitle}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              {video?.videochanel}
            </p>

            <p className="text-sm text-muted-foreground">
              {video?.views?.toLocaleString()} views •{" "}
              {video?.createdAt
                ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                : "Just now"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}