import Link from "next/link";

type RelatedVideo = {
  id: string;
  title: string;
  channel: string;
  views: number;
  videoPath: string;
};

type RelatedVideosProps = {
  videos: RelatedVideo[];
};

export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-4">

      {/* Related Videos List */}
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/watch/${video.id}`}
          className="flex gap-2 group"
        >

          {/* Video Preview */}
          <div className="relative w-40 aspect-video bg-gray-100 rounded-lg overflow-hidden shrink-0">
            <video
              src={video.videoPath}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Video Information */}
          <div className="flex-1 min-w-0">

            <h3 className="font-medium text-sm line-clamp-2">
              {video.title}
            </h3>

            <p className="text-xs text-gray-600 mt-1">
              {video.channel}
            </p>

            <p className="text-xs text-gray-600">
              {video.views.toLocaleString()} views
            </p>

          </div>

        </Link>
      ))}

    </div>
  );
}