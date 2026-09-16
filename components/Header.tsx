"use client";

import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./ChannelDialogue";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

type NotificationType = {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

const Header = ({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) => {

  const { user, logout, handlegooglesignin } = useUser();

  const [currentPlan, setCurrentPlan] = useState<
    "Free" | "Bronze" | "Silver" | "Gold"
  >("Free");

  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const notificationButtonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();

  // Subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

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

    fetchSubscription();
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?._id) return;

    try {
      const res = await axiosInstance.get(
        `/notification?userId=${user._id}`
      );

      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (error) {
      console.log("Notification fetch error:", error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!user?._id) return;

    try {
      const res = await axiosInstance.get(
        `/notification/unread-count?userId=${user._id}`
      );

      if (res.data.success) {
        setUnreadCount(res.data.count);
      }
    } catch (error) {
      console.log("Unread count error:", error);
    }
  };

  // Initial notification fetch + refresh
  useEffect(() => {
    if (!user?._id) return;

    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();

      if (showNotifications) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user, showNotifications]);

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      const clickedInsidePanel =
        notificationRef.current?.contains(target);
      const clickedBell =
        notificationButtonRef.current?.contains(target);

      if (!clickedInsidePanel && !clickedBell) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // Open notification panel
  const handleNotificationClick = async () => {
    const newState = !showNotifications;

    setShowNotifications(newState);

    if (newState) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (
    notificationId: string
  ) => {
    try {
      await axiosInstance.post("/notification/read", {
        notificationId,
      });

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.log("Mark notification error:", error);
    }
  };

  // Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (searchQuery.trim()) {
      router.push(
        `/search?q=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  // Voice Search
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;

      setSearchQuery(text);

      router.push(
        `/search?q=${encodeURIComponent(text)}`
      );
    };

    recognition.onerror = (event: any) => {
      console.log("Voice search error:", event.error);
    };

    recognition.start();
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 py-2 bg-background border-b border-border text-foreground">

        {/* Left */}
        <div className="flex items-center gap-4">

          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="w-6 h-6" />
          </Button>

          <Link href="/" className="flex items-center gap-1">
            <div className="bg-red-600 p-1 rounded">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>

            <span className="text-xl font-medium text-foreground">
              YourTube
            </span>

            <span className="text-xs text-muted-foreground ml-1">
              IN
            </span>
          </Link>
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
        >
          <div className="flex flex-1">
            <Input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              onKeyDown={handleKeypress}
              className="rounded-l-full border-r-0 focus-visible:ring-0"
            />

            <Button
              type="submit"
              className="rounded-r-full px-6 border border-l-0 bg-muted hover:bg-accent text-foreground"
            >
              <Search className="w-5 h-5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={handleVoiceSearch}
          >
            <Mic className="w-5 h-5" />
          </Button>
        </form>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ThemeToggle />

              {/* Subscription */}
              {currentPlan !== "Free" ? (
                <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-yellow-100 border border-yellow-300">
                  <span className="text-xs font-semibold text-yellow-700">
                    {currentPlan} Member
                  </span>

                  <span className="text-[10px] text-green-600">
                    Ad-Free
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center px-3 py-1 rounded-lg bg-muted border border-border">
                  <span className="text-xs font-semibold text-foreground">
                    Free User
                  </span>

                  <span className="text-[10px] text-red-500">
                    Ads Enabled
                  </span>
                </div>
              )}

              {/* Upload */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (user?.channelname) {
                    router.push(`/channel/${user._id}`);
                  } else {
                    setisdialogeopen(true);
                  }
                }}
                title="Upload Video"
              >
                <VideoIcon className="w-6 h-6" />
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  ref={(element) => {
                    notificationButtonRef.current = element as HTMLButtonElement | null;
                  }}
                  variant="ghost"
                  size="icon"
                  onClick={handleNotificationClick}
                  className="relative"
                >
                  <Bell className="w-6 h-6" />

                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-red-600 text-white text-[10px] font-bold">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notification Panel */}
                {showNotifications && (
                  <div
                    ref={notificationRef}
                    className="absolute right-0 top-12 z-50 w-[380px] max-h-[500px] overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
                  >

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h2 className="text-lg font-semibold">
                        Notifications
                      </h2>

                      <span className="text-xs text-muted-foreground">
                        {unreadCount} unread
                      </span>
                    </div>

                    {/* Notifications */}
                    <div className="max-h-[430px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                          <Bell className="w-14 h-14 text-muted-foreground mb-4" />

                          <p className="font-medium">
                            No notifications yet
                          </p>

                          <p className="text-sm text-muted-foreground mt-1">
                            Your notifications will appear here.
                          </p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => {
                              if (!notification.isRead) {
                                markNotificationAsRead(
                                  notification._id
                                );
                              }
                            }}
                            className={`px-4 py-4 border-b border-border cursor-pointer hover:bg-muted transition ${!notification.isRead
                              ? "bg-muted/60"
                              : ""
                              }`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-1">
                                <Bell className="w-5 h-5 text-red-500" />
                              </div>

                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {notification.message}
                                </p>

                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </p>
                              </div>

                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full bg-red-600 mt-2" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                  <Avatar>
                    <AvatarImage src={user.image} />

                    <AvatarFallback>
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56"
                >
                  {user?.channelname ? (
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/channel/${user._id}`)
                      }
                    >
                      Your Channel
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() =>
                        setisdialogeopen(true)
                      }
                    >
                      Create Channel
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/history")}
                  >
                    History
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => router.push("/liked")}
                  >
                    Liked Videos
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      router.push("/watch-later")
                    }
                  >
                    Watch Later
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={logout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              onClick={handlegooglesignin}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          )}
        </div>
      </header>

      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </>
  );
};

export default Header;