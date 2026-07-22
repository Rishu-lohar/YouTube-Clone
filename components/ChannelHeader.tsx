"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type Channel = {
  id: string;
  channelname: string;
  description: string;
};

type ChannelHeaderProps = {
  channel: Channel;
};

export default function ChannelHeader({
  channel,
}: ChannelHeaderProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div className="w-full">

      {/* Channel Banner */}
      <div className="h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500" />

      {/* Channel Information */}
      <div className="px-4 py-6">

        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Channel Avatar */}
          <Avatar className="w-20 h-20 md:w-32 md:h-32">

            <AvatarFallback className="text-2xl">
              {channel.channelname[0]}
            </AvatarFallback>

          </Avatar>

          {/* Channel Details */}
          <div className="flex-1 space-y-2">

            <h1 className="text-2xl md:text-4xl font-bold">
              {channel.channelname}
            </h1>

            <p className="text-sm text-gray-600">
              @
              {channel.channelname
                .toLowerCase()
                .replace(/\s+/g, "")}
            </p>

            <p className="text-sm text-gray-700 max-w-2xl">
              {channel.description}
            </p>

          </div>

          {/* Subscribe Button */}
          <Button
            onClick={() =>
              setIsSubscribed(!isSubscribed)
            }
            variant={
              isSubscribed
                ? "outline"
                : "default"
            }
          >
            {isSubscribed
              ? "Subscribed"
              : "Subscribe"}
          </Button>

        </div>

      </div>

    </div>
  );
}