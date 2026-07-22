import ChannelHeader from "@/components/ChannelHeader";
import ChannelTabs from "@/components/ChannelTabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";

export default function ChannelPage() {

  const channel = {
    id: "1",
    channelname: "Rishu Channel",
    description:
      "Welcome to my channel. Here you will find amazing videos.",
  };

  const videos = [
    {
      id: "1",
      title: "My First YouTube Clone Video",
      channel: "Rishu Channel",
      views: 45000,
      videoPath: "/videos/demo.mp4",
    },
    {
      id: "2",
      title: "Amazing Nature Documentary",
      channel: "Rishu Channel",
      views: 23000,
      videoPath: "/videos/demo.mp4",
    },
  ];

  return (
    <div className="flex-1 min-h-screen bg-white">

      <ChannelHeader channel={channel} />

      <ChannelTabs />

      <div className="px-4 pb-8">
        <VideoUploader
          channelId={channel.id}
          channelName={channel.channelname}
        />
      </div>

      <div className="px-4 pb-8">
        <ChannelVideos videos={videos} />
      </div>

    </div>
  );
}