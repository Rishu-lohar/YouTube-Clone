"use client";

import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideo";
import VideoInfo from "@/components/VideoInfo";
import VideoPlayer from "@/components/VideoPlayer";
import axiosInstance from "@/lib/axiosinstance";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

type VideoItem = {
  _id: string;
  filepath: string;
  videotitle: string;
  videochanel: string;
  views?: number;
  createdAt?: string;
};

const WatchPage = () => {
  const params = useParams();
  const id = params?.id as string;
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchVideo();
  }, [id]);

  if (loading) {
    return <div>Loading..</div>;
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
    }));

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <VideoPlayer videoPath={selectedVideo.filepath} />
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