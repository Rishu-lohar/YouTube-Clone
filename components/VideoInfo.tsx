"use client";

import { useState } from "react";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type VideoInfoProps = {
  video: {
    title: string;
    channel: string;
    views: number;
    likes: number;
    dislikes: number;
  };
};

export default function VideoInfo({ video }: VideoInfoProps) {

  // Like aur Dislike ki current counting
  const [likes, setLikes] = useState(video.likes);
  const [dislikes, setDislikes] = useState(video.dislikes);

  // User ne Like/Dislike kiya hai ya nahi
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);

  // Description full show karni hai ya short
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Watch Later button ki state
  const [isWatchLater, setIsWatchLater] = useState(false);

  // Like button
  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);

      if (isDisliked) {
        setDislikes(dislikes - 1);
        setIsDisliked(false);
      }
    }
  };

  // Dislike button
  const handleDislike = () => {
    if (isDisliked) {
      setDislikes(dislikes - 1);
      setIsDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setIsDisliked(true);

      if (isLiked) {
        setLikes(likes - 1);
        setIsLiked(false);
      }
    }
  };

  return (
    <div className="space-y-4">

      {/* Video Title */}
      <h1 className="text-xl font-semibold">
        {video.title}
      </h1>

      {/* Channel + Action Buttons */}
      <div className="flex items-center justify-between gap-4">

        {/* Channel Information */}
        <div className="flex items-center gap-3">

          <Avatar className="w-10 h-10">
            <AvatarFallback>
              {video.channel[0]}
            </AvatarFallback>
          </Avatar>

          <div>
            <h3 className="font-medium">
              {video.channel}
            </h3>

            <p className="text-sm text-gray-600">
              1.2M subscribers
            </p>
          </div>

          <Button>
            Subscribe
          </Button>

        </div>

        {/* Video Action Buttons */}
        <div className="flex items-center gap-2">

          {/* Like + Dislike */}
          <div className="flex items-center bg-gray-100 rounded-full">

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black" : ""
                }`}
              />

              {likes.toLocaleString()}
            </Button>

            <div className="w-px h-6 bg-gray-300" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black" : ""
                }`}
              />

              {dislikes.toLocaleString()}
            </Button>

          </div>

          {/* Watch Later */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
            onClick={() => setIsWatchLater(!isWatchLater)}
          >
            <Clock className="w-5 h-5 mr-2" />

            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>

          {/* Share */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>

          {/* More */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>

        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-100 rounded-lg p-4">

        <p className="text-sm font-medium mb-2">
          {video.views.toLocaleString()} views
        </p>

        <div
          className={`text-sm ${
            showFullDescription ? "" : "line-clamp-2"
          }`}
        >
          This is a sample video description for our YouTube Clone.
          Here we can display complete information about the video.
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0"
          onClick={() =>
            setShowFullDescription(!showFullDescription)
          }
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>

      </div>

    </div>
  );
}