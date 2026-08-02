"use client";

import { useEffect, useState } from "react";
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

  const [showFullDescription, setShowFullDescription] = useState(false);

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

  // handleDownload()
  const handleDownload = async ()=>{
    if(!user) return;

    try{
      const res = await axiosInstance.post(`/download/${video._id}`,{
        userId: user._id,
      });
      alert(res.data.message);
    }
    catch(error){
      console.log(error);
    }
  };


  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{video.videotitle}</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {video.videochanel?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
          </div>

          <Button className="ml-4">
            Subscribe
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full bg-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`mr-2 h-5 w-5 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>

            <div className="h-6 w-px bg-gray-300" />

            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`mr-2 h-5 w-5 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full bg-gray-100 ${
              isWatchLater ? "text-primary" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="mr-2 h-5 w-5" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-gray-100"
          >
            <Share className="mr-2 h-5 w-5" />
            Share
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-gray-100"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-gray-100"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-gray-100 p-4">
        <div className="mb-2 flex gap-4 text-sm font-medium">
          <span>{video.views.toLocaleString()} views</span>

          <span>
            {video?.createdAt
              ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
              : "Just now"}
          </span>
        </div>

        <div
          className={`text-sm ${
            showFullDescription ? "" : "line-clamp-3"
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
    </div>
  );
};

export default VideoInfo;