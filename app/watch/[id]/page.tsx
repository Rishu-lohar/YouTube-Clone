"use client";

import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideo";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type VideoItem = {
  _id: string;
  filepath: string;
  videotitle: string;
  videochanel: string;
  views?: number;
  createdAt?: string;
  isPremium?: boolean;
};

const WatchPage = () => {
  const params = useParams();
  const id = params?.id as string;

  const { user } = useUser();

  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState("Free");

  const fetchVideo = async () => {
    if (!id) return;

    try {
      const res = await axiosInstance.get("/video/getall");
      const videos: VideoItem[] = res.data || [];

      setAllVideos(videos);

      const current = videos.find((vid) => vid._id === id) ?? null;
      setSelectedVideo(current);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    if (!user) {
      setCurrentPlan("Free");
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/subscription/status/${user._id}`
      );

      if (res.data.subscription) {
        setCurrentPlan(res.data.subscription.plan);
      } else {
        setCurrentPlan("Free");
      }
    } catch (error) {
      console.log(error);
      setCurrentPlan("Free");
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchSubscription();
  }, [id, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!selectedVideo) {
    return <div>Video not found</div>;
  }

  const relatedVideos = allVideos
    .filter((video) => video._id !== id)
    .map((video) => ({
      id: video._id,
      title: video.videotitle,
      channel: video.videochanel,
      views: video.views || 0,
      videoPath: video.filepath,
      isPremium: video.isPremium,
    }));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {selectedVideo.isPremium && currentPlan === "Free" ? (
              <div className="aspect-video rounded-lg border bg-gray-100 flex flex-col items-center justify-center text-center p-8">
                <h2 className="text-3xl font-bold">
                  🔒 Premium Video
                </h2>

                <p className="mt-4 text-gray-600">
                  This video is available only for Premium users.
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Upgrade to Bronze, Silver or Gold to continue watching.
                </p>

                <a
                  href="/subscriptions"
                  className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Upgrade Now
                </a>
              </div>
            ) : (
              <VideoPlayer videoPath={selectedVideo.filepath} />
            )}

            <VideoInfo video={selectedVideo} />

            <Comments videoId={id} />
          </div>

          <div className="space-y-4">
            <RelatedVideos videos={relatedVideos} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchPage;