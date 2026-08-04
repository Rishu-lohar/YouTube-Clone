"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import ChannelHeader from "@/components/ChannelHeader";
import ChannelTabs from "@/components/ChannelTabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

type ChannelVideo = {
  _id: string;
  filepath: string;
  videotitle: string;
  videochanel: string;
  uploader?: string;
  description?: string;
  views?: number;
  createdAt?: string;
};

const ChannelPage = () => {
  const params = useParams();
  const channelId = params?.id as string;
  const { user } = useUser();
  const [videos, setVideos] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      if (!channelId) return;
      setLoading(true);

      try {
        const response = await axiosInstance.get("/video/getall");
        const allVideos: ChannelVideo[] = response.data || [];
        const matchedVideos = allVideos.filter(
          (video) =>
            video.uploader === channelId ||
            slugify(video.videochanel || "") === channelId
        );

        setVideos(matchedVideos);
      } catch (error) {
        console.error(error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [channelId]);

  const channelName = useMemo(() => {
    if (user && (user._id === channelId || user.id === channelId)) {
      return user.channelname || user.name || "Your Channel";
    }

    return videos[0]?.videochanel || "Channel";
  }, [user, channelId, videos]);

  const channelDescription = useMemo(() => {
    if (user && (user._id === channelId || user.id === channelId)) {
      return user.description ||
        "Upload videos, manage your channel, and connect with your audience.";
    }

    return (
      videos[0]?.description ||
      "This channel features videos from the selected uploader and channel."
    );
  }, [user, channelId, videos]);

  const isOwner = Boolean(
    user && (user._id === channelId || user.id === channelId)
  );

  if (loading) {
    return <div className="min-h-screen bg-white p-6">Loading...</div>;
  }

  return (
    <div className="flex-1 min-h-screen bg-white">
      <ChannelHeader
        channel={{
          id: channelId || "",
          channelname: channelName,
          description: channelDescription,
        }}
      />

      <ChannelTabs />

      <div className="px-4 pb-8">
        {isOwner && (
          <VideoUploader
            channelId={user._id}
            channelName={channelName}
          />
        )}
      </div>

      <div className="px-4 pb-8">
        <ChannelVideos videos={videos} />
      </div>
    </div>
  );
};

export default ChannelPage;
