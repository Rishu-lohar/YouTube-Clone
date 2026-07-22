import VideoCard from "@/components/VideoCard";

type Video = {
  id: string;
  title: string;
  channel: string;
  views: number;
  videoPath: string;
};

type ChannelVideosProps = {
  videos: Video[];
};

export default function ChannelVideos({
  videos,
}: ChannelVideosProps) {

  // Agar ek bhi video nahi hai
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No videos uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div>

      <h2 className="text-xl font-semibold mb-4">
        Videos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
          />
        ))}

      </div>

    </div>
  );
}