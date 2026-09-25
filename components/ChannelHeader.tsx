"use client";

import { ChangeEvent, useState } from "react";
import { Camera, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getVideoSrc } from "@/lib/videoSrc";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { toast } from "sonner";

type Channel = {
  id: string;
  channelname: string;
  description: string;
  image?: string;
};

type ChannelHeaderProps = {
  channel: Channel;
  isOwner: boolean;
  onEditProfile: () => void;
};

export default function ChannelHeader({
  channel,
  isOwner,
  onEditProfile,
}: ChannelHeaderProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const { user, login } = useUser();

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    if (!user?._id) {
      toast.error("Sign in to update your profile picture.");
      return;
    }

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (
      !allowedImageTypes.includes(image.type) ||
      image.size > 5 * 1024 * 1024
    ) {
      toast.error("Choose a JPEG, PNG, WebP, or GIF image under 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    setIsUploadingImage(true);
    try {
      const response = await axiosInstance.post(
        `/user/profile-image/${user._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      login(response.data);
      toast.success("Profile picture updated.");
    } catch (error) {
      console.error("Unable to upload profile picture:", error);
      toast.error("Unable to update your profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="w-full">

      {/* Channel Banner */}
      <div className="h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500" />

      {/* Channel Information */}
      <div className="px-4 py-6">

        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Channel Avatar */}
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarImage src={getVideoSrc(channel.image)} />
            <AvatarFallback className="text-2xl">
              {channel.channelname?.[0] || "C"}
            </AvatarFallback>
          </Avatar>

          {/* Channel Details */}
          <div className="flex-1 space-y-2">

            <h1 className="text-2xl md:text-4xl font-bold">
              {channel.channelname}
            </h1>

            <p className="text-sm text-muted-foreground">
              @
              {channel.channelname
                .toLowerCase()
                .replace(/\s+/g, "")}
            </p>

            <p className="text-sm text-foreground max-w-2xl">
              {channel.description}
            </p>

          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  onClick={onEditProfile}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    disabled={isUploadingImage}
                    onChange={handleProfileImageChange}
                  />
                  <Camera className="mr-2 h-4 w-4" />
                  {isUploadingImage ? "Uploading..." : "Change picture"}
                </label>
              </>
            )}
            <Button
              onClick={() => setIsSubscribed(!isSubscribed)}
              variant={isSubscribed ? "outline" : "default"}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          </div>

        </div>

      </div>

    </div>
  );
}