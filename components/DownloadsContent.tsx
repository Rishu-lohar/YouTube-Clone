"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Download, Play} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { getVideoSrc } from "@/lib/videoSrc";
import VideoThumbnail from "@/components/VideoThumbnail";

export default function DownloadsContent() {
  const { user } = useUser();
  const [downloads, setdownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loaddownloads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loaddownloads = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.get(`/download/${user._id}`);
      setdownloads(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

//   const handleRemoveFromdownloads = async (item: any) => {
//     if (!user) return;
//     const videoId = item?.videoid?._id;
//     if (!videoId) return;

//     try {
//       await axiosInstance.post(`/watch/${videoId}`, { userId: user._id });
//       setdownloads((prev) => prev.filter((entry) => entry._id !== item._id));
//     } catch (error) {
//       console.error(error);
//     }
//   };

  if (loading) {
    return <div>Loading downloads...</div>;
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <Download className="mx-auto mb-4 h-16 w-16 text-gray-400" />

        <h2 className="mb-2 text-xl font-semibold">
          Download videos
        </h2>

        <p className="text-gray-600">
          Sign in to access your Downloads.
        </p>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="py-12 text-center">
        <Download className="mx-auto mb-4 h-16 w-16 text-gray-400" />

        <h2 className="mb-2 text-xl font-semibold">No downloaded videos </h2>

        <p className="text-gray-600">
          Downloaded videos will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{downloads.length} videos</p>

        <Button className="flex items-center gap-2">
          <Play className="h-4 w-4" />
          Play all
        </Button>
      </div>

      <div className="space-y-4">
        {downloads.map((item) => {
          const video = item.videoid || {};
          const videoSrc = getVideoSrc(video.filepath);

          return (
            <div key={item._id} className="group flex gap-4">
              <Link href={`/watch/${video._id}`} className="flex-shrink-0">
                <div className="relative aspect-video w-40 overflow-hidden rounded bg-gray-100">
                  <VideoThumbnail
                    src={videoSrc}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:text-blue-600">
                    {video.videotitle}
                  </h3>
                </Link>

                <p className="text-sm text-gray-600">{video.videochanel}</p>

                <p className="text-sm text-gray-600">
                  {video.views?.toLocaleString() ?? 0} views • {" "}
                  {video.createdAt
                    ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                    : "Just now"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Added {item.createdAt
                    ? `${formatDistanceToNow(new Date(item.createdAt))} ago`
                    : "recently"}
                </p>
              </div>

              {/* <DropdownMenu>
                
                <DropdownMenuTrigger
                  className="opacity-0 transition-opacity group-hover:opacity-100 inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted"
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleRemoveFromdownloads(item)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove from Downloads
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
