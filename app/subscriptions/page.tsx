"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

export default function SubscriptionsPage() {
  const { user } = useUser();

  const [subscribedChannels, setSubscribedChannels] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  const fetchSubscribedChannels = async () => {
    if (!user) {
      setSubscribedChannels([]);
      setLoadingChannels(false);
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/channel-subscription/my-subscriptions/${user._id}`
      );

      setSubscribedChannels(res.data.subscriptions || []);
    } catch (error) {
      console.error(error);
      setSubscribedChannels([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, [user]);

  const handleUnsubscribe = async (channelId: string) => {
    if (!user) return;

    try {
      await axiosInstance.post(
        "/channel-subscription/unsubscribe",
        {
          subscriberId: user._id,
          channelId,
        }
      );

      fetchSubscribedChannels();
    } catch (error) {
      console.error(error);
      alert("Unable to unsubscribe");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Subscribed Channels */}
      {loadingChannels ? (
        <div className="text-center py-10">
          Loading subscriptions...
        </div>
      ) : subscribedChannels.length > 0 ? (
        <div className="mb-16">
          <h1 className="text-3xl font-bold mb-6">
            My Subscribed Channels
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribedChannels.map((subscription) => {
              const channel = subscription.channel;

              return (
                <div
                  key={subscription._id}
                  className="flex items-center justify-between rounded-xl border p-4"
                >
                  <div className="flex items-center gap-4">

                    {/* Channel Image */}
                    <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                      {channel?.image ? (
                        <img
                          src={channel.image}
                          alt={
                            channel.channelname ||
                            channel.name ||
                            "Channel"
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-bold">
                          {(
                            channel?.channelname ||
                            channel?.name ||
                            "C"
                          ).charAt(0)}
                        </span>
                      )}
                    </div>

                    {/* Channel Info */}
                    <div>
                      <h2 className="font-semibold">
                        {channel?.channelname ||
                          channel?.name ||
                          "Unknown Channel"}
                      </h2>

                      <p className="text-sm text-muted-foreground">
                        {channel?.description ||
                          "Subscribed channel"}
                      </p>
                    </div>
                  </div>

                  {/* Unsubscribe */}
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUnsubscribe(channel?._id)
                    }
                  >
                    Unsubscribe
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <Bell
              size={50}
              className="text-muted-foreground"
            />
          </div>

          <h1 className="text-3xl font-bold mb-3">
            No Subscriptions Yet
          </h1>

          <p className="text-muted-foreground max-w-md mb-6">
            Subscribe to your favorite channels to see
            their latest videos here.
          </p>

          <Link
            href="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition"
          >
            Explore Videos
          </Link>
        </div>
      )}

      {/* Premium Membership Plans */}
      <div className="border-t pt-10">
        <h2 className="text-3xl font-bold text-center mb-8">
          Upgrade to Premium
        </h2>

        <SubscriptionPlans />
      </div>

    </div>
  );
}