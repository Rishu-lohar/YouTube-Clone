"use client";

import { useEffect, useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const { user } = useUser();

  const [likes, setLikes] = useState(video?.Like || 0);
  const [dislikes, setDislikes] = useState(video?.Dislike || 0);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [notInterested, setNotInterested] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");

  useEffect(() => {
    setLikes(video?.Like || 0);
    setDislikes(video?.Dislike || 0);

    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);

  useEffect(() => {
    const handleViews = async () => {
      try {
        if (user) {
          await axiosInstance.post(`/history/${video._id}`, {
            userId: user._id,
          });
        } else {
          await axiosInstance.post(`/history/views/${video._id}`);
        }
      } catch (error) {
        console.log(error);
      }
    };

    if (video?._id) {
      handleViews();
    }
  }, [user, video]);

  const handleLike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (res.data.liked) {
        if (isLiked) {
          setLikes((prev: number) => prev - 1);
          setIsLiked(false);
        } else {
          setLikes((prev: number) => prev + 1);
          setIsLiked(true);

          if (isDisliked) {
            setDislikes((prev: number) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDislike = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user._id,
      });

      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: number) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: number) => prev + 1);
          setIsDisliked(true);

          if (isLiked) {
            setLikes((prev: number) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubscriptionStatus = async () => {
    if (!user || !video?.uploader) {
      setIsSubscribed(false);
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/channel-subscription/status?subscriberId=${user._id}&channelId=${video.uploader}`
      );

      setIsSubscribed(res.data.subscribed);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSubscriberCount = async () => {
    if (!video?.uploader) return;

    try {
      const res = await axiosInstance.get(
        `/channel-subscription/count/${video.uploader}`
      );

      setSubscriberCount(res.data.count);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
    fetchSubscriberCount();
  }, [user, video]);

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please login to subscribe");
      return;
    }

    if (!video?.uploader) {
      alert("Channel information not available");
      return;
    }

    try {
      if (isSubscribed) {
        const res = await axiosInstance.post(
          "/channel-subscription/unsubscribe",
          {
            subscriberId: user._id,
            channelId: video.uploader,
          }
        );

        setIsSubscribed(false);
        setSubscriberCount((prev) => Math.max(0, prev - 1));
        alert(res.data.message);
      } else {
        const res = await axiosInstance.post(
          "/channel-subscription/subscribe",
          {
            subscriberId: user._id,
            channelId: video.uploader,
          }
        );

        setIsSubscribed(true);
        setSubscriberCount((prev) => prev + 1);
        alert(res.data.message);
      }
    } catch (error: any) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  const handleWatchLater = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user._id,
      });

      setIsWatchLater(res.data.watchlater);
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);


  // handleShare
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/watch/${video._id}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: video.videotitle,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert("Video link copied!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleReport = async () => {
    if (!user) {
      alert("Please login to report this video");
      return;
    }

    if (!reportReason) {
      alert("Please select a reason");
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/video/report/${video._id}`,
        {
          userid: user._id,
          reason: reportReason,
        }
      );

      if (res.data.success) {
        alert("Video Reported Successfully");
        setReportOpen(false);
        setReportReason("");
      }
    } catch (error: any) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // handleDownload()
  const handleDownload = async () => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(`/download/${video._id}`, {
        userId: user._id,
      });
      alert(res.data.message);
    }
    catch (error: any) {
      console.log(error);

      alert(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  if (notInterested) {
    return null;
  }


  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {video.videochanel?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-muted-foreground">
              {subscriberCount.toLocaleString()} subscribers
            </p>
          </div>

          <Button
            className="ml-0 sm:ml-4"
            onClick={handleSubscribe}
          >
            {isSubscribed ? "Subscribed" : "Subscribe"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full bg-muted">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`mr-2 h-5 w-5 ${isLiked ? "fill-foreground text-foreground" : ""}`}
              />
              {likes.toLocaleString()}
            </Button>

            <div className="h-6 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`mr-2 h-5 w-5 ${isDisliked ? "fill-foreground text-foreground" : ""}`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full bg-muted ${isWatchLater ? "text-primary" : ""}`}
            onClick={handleWatchLater}
          >
            <Clock className="mr-2 h-5 w-5" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-muted"
            onClick={handleShare}
          >
            <Share className="mr-2 h-5 w-5" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-muted"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>

          <div className="relative" ref={moreMenuRef}>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-muted"
              onClick={() => setShowMoreMenu((prev) => !prev)}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>

            {showMoreMenu && (
              <div className="absolute right-0 top-11 z-50 w-48 rounded-lg border border-border bg-background shadow-lg">

                <button
                  className="w-full px-4 py-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setShowMoreMenu(false);
                    window.location.href = "/subscriptions";
                  }}
                >
                  📺 Watch ad-free
                </button>

                <button
                  className="w-full px-4 py-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setReportOpen(true);
                  }}
                >
                  🚩 Report
                </button>

                <button
                  className="w-full px-4 py-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setShowMoreMenu(false);
                    setNotInterested(true);
                  }}
                >
                  👎 Not interested
                </button>

              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="mb-2 flex gap-4 text-sm font-medium">
          <span>{video.views.toLocaleString()} views</span>

          <span>
            {video?.createdAt
              ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
              : "Just now"}
          </span>
        </div>

        <div
          className={`text-sm ${showFullDescription ? "" : "line-clamp-3"
            }`}
        >
          <p>{video.description || "No description available."}</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-auto p-0 font-medium"
          onClick={() =>
            setShowFullDescription(!showFullDescription)
          }
        >
          {showFullDescription
            ? "Show less"
            : "Show more"}
        </Button>
      </div>

      {reportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold">
              Report Video
            </h2>

            <div className="space-y-3">
              {[
                "Spam",
                "Harassment",
                "Hate Speech",
                "Violence",
                "False Information",
                "Other",
              ].map((reason) => (
                <label
                  key={reason}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={(e) =>
                      setReportReason(e.target.value)
                    }
                  />

                  <span className="text-sm">{reason}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setReportOpen(false);
                  setReportReason("");
                }}
              >
                Cancel
              </Button>

              <Button onClick={handleReport}>
                Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoInfo;