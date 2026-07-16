import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Video = {
  id: string;
  title: string;
  channel: string;
  views: number;
  videoPath: string;
};

type VideoCardProps = {
  video: Video;
};

const VideoCard = ({ video }: VideoCardProps) => {
  return (
    <Link href={`/watch/${video.id}`} className="group">
      <div className="space-y-3">

        {/* Video Section */}
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <video
            src={video.videoPath}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />

          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
            10:24
          </div>
        </div>

        {/* Video Information */}
        <div className="flex gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback>
              {video.channel[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2">
              {video.title}
            </h3>

            <p className="text-sm text-gray-600 mt-1">
              {video.channel}
            </p>

            <p className="text-sm text-gray-600">
              {video.views.toLocaleString()} views
            </p>
          </div>
        </div>

      </div>
    </Link>
  );
};

export default VideoCard;