"use client";

import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import VideoCard from "./VideoCard";

type VideoItem = {
  _id: string;
  filepath: string;
  videotitle: string;
  videochanel: string;
  uploader?: string;
  views?: number;
  createdAt?: string;
};

const VideoGrid = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos(res.data);
      } catch (error) {
        console.error(error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (loadError) {
    return (
      <p role="alert" className="py-10 text-center text-muted-foreground">
        Unable to load videos. Please try again later.
      </p>
    );
  }

  if (videos.length === 0) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        No videos available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard
          key={video._id}
          video={video}
          onDeleted={(videoId) =>
            setVideos((current) =>
              current.filter((item) => item._id !== videoId)
            )
          }
        />
      ))}
    </div>
  );
};

export default VideoGrid;