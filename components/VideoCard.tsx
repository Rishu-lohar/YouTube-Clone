"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Crown, MoreVertical, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { getVideoSrc } from "@/lib/videoSrc";
import VideoThumbnail from "./VideoThumbnail";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Button } from "./ui/button";

interface VideoCardProps {
  video: {
    _id: string;
    filepath: string;
    videotitle: string;
    videochanel: string;
    uploader?: string;
    views?: number;
    createdAt?: string;
    isPremium?: boolean;
  };
  onDeleted?: (videoId: string) => void;
}

export default function VideoCard({
  video,
  onDeleted,
}: VideoCardProps) {
  const { user } = useUser();

  const [isDeleting, setIsDeleting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Report dialog states
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const videoSrc = getVideoSrc(video?.filepath);

  const isOwner = Boolean(
    user?._id && video.uploader === user._id
  );

  // Not Interested ke baad card hide kar do
  if (isHidden) {
    return null;
  }

  // =========================
  // OPEN REPORT DIALOG
  // =========================
  const openReportDialog = () => {
    setReportReason("");
    setReportOpen(true);
  };

  // =========================
  // REPORT VIDEO
  // =========================
  const handleReport = async () => {
    if (!user?._id || !reportReason) {
      return;
    }

    try {
      await axiosInstance.put(`/video/report/${video._id}`, {
        userid: user._id,
        reason: reportReason,
      });

      toast.success("Video reported.");

      setReportOpen(false);
      setReportReason("");
    } catch (error: any) {
      // Duplicate report
      if (error?.response?.status === 400) {
        toast.info("You have already reported this video.");

        setReportOpen(false);
        setReportReason("");

        return;
      }

      console.error("Unable to report video:", error);

      toast.error("Unable to report this video.");
    }
  };

  // =========================
  // NOT INTERESTED
  // =========================
  const handleNotInterested = () => {
    setIsHidden(true);

    toast.success(
      "Video removed from your recommendations."
    );
  };

  // =========================
  // DELETE VIDEO
  // =========================
  const handleDelete = async () => {
    if (!user?._id) {
      return;
    }

    if (
      !window.confirm(
        `Delete "${video.videotitle}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      await axiosInstance.delete(`/video/${video._id}`, {
        data: {
          userId: user._id,
        },
      });

      onDeleted?.(video._id);

      toast.success("Video deleted.");
    } catch (error) {
      console.error(
        "Unable to delete video:",
        error
      );

      toast.error(
        "Unable to delete this video."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group">
        {/* =========================
            THUMBNAIL + VIDEO INFO
            ========================= */}
        <Link href={`/watch/${video?._id}`}>
          <div className="space-y-3">

            {/* Thumbnail */}
            <div className="relative">
              <VideoThumbnail
                src={videoSrc}
                className="aspect-video h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />

              {/* Premium Badge */}
              {video?.isPremium && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-yellow-500 px-2 py-1 text-xs font-semibold text-white shadow">
                  <Crown className="h-3 w-3" />
                  Premium
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="flex gap-3">

              {/* Channel Avatar */}
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback>
                  {video?.videochanel?.charAt(0) || "Y"}
                </AvatarFallback>
              </Avatar>

              {/* Video Details */}
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
                    ? `${formatDistanceToNow(
                        new Date(video.createdAt)
                      )} ago`
                    : "Just now"}
                </p>

              </div>
            </div>

          </div>
        </Link>

        {/* =========================
            VIDEO OPTIONS
            Link ke BAHAR hai
            ========================= */}
        <div className="mt-[-45px] flex justify-end pr-1 pb-2">

          <DropdownMenu>

            <DropdownMenuTrigger
              aria-label="Video options"
              disabled={isDeleting}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreVertical className="h-4 w-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              {/* =========================
                  OWNER
                  ========================= */}
              {isOwner ? (
                <DropdownMenuItem
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <Trash2 />
                  Delete video
                </DropdownMenuItem>
              ) : (
                /* =========================
                   NORMAL USER
                   ========================= */
                <>
                  {/* Watch Ad-Free */}
                  <DropdownMenuItem
                    onClick={() => {
                      window.location.href =
                        "/subscriptions";
                    }}
                  >
                    📺 Watch ad-free
                  </DropdownMenuItem>

                  {/* Report */}
                  <DropdownMenuItem
                    onClick={openReportDialog}
                  >
                    🚩 Report
                  </DropdownMenuItem>

                  {/* Not Interested */}
                  <DropdownMenuItem
                    onClick={handleNotInterested}
                  >
                    👎 Not interested
                  </DropdownMenuItem>
                </>
              )}

            </DropdownMenuContent>

          </DropdownMenu>
        </div>
      </div>

      {/* =========================
          REPORT VIDEO DIALOG
          ========================= */}
      <Dialog
        open={reportOpen}
        onOpenChange={setReportOpen}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Report Video
            </DialogTitle>
          </DialogHeader>

          {/* Report Reasons */}
          <div className="space-y-4 py-2">

            {/* Spam */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="Spam"
                checked={reportReason === "Spam"}
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>Spam</span>
            </label>

            {/* Harassment */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="Harassment"
                checked={
                  reportReason === "Harassment"
                }
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>Harassment</span>
            </label>

            {/* Hate Speech */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="Hate Speech"
                checked={
                  reportReason === "Hate Speech"
                }
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>Hate Speech</span>
            </label>

            {/* Violence */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="Violence"
                checked={
                  reportReason === "Violence"
                }
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>Violence</span>
            </label>

            {/* False Information */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="False Information"
                checked={
                  reportReason ===
                  "False Information"
                }
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>False Information</span>
            </label>

            {/* Other */}
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name={`report-${video._id}`}
                value="Other"
                checked={reportReason === "Other"}
                onChange={(e) =>
                  setReportReason(e.target.value)
                }
              />
              <span>Other</span>
            </label>

          </div>

          {/* Dialog Buttons */}
          <DialogFooter>

            <Button
              variant="outline"
              onClick={() => {
                setReportOpen(false);
                setReportReason("");
              }}
            >
              Cancel
            </Button>

            <Button
              onClick={handleReport}
              disabled={!reportReason}
            >
              Report
            </Button>

          </DialogFooter>

        </DialogContent>
      </Dialog>
    </>
  );
}