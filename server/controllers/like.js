import video from "../models/video.js";
import like from "../models/like.js";
import { createActivityNotification } from "./Notification.js";

export const handlelike = async (req, res) => {
  try {
    const { userId } = req.body;
    const { videoId } = req.params;

    const existingLike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingLike) {
      await like.findByIdAndDelete(existingLike._id);

      await video.findByIdAndUpdate(videoId, {
        $inc: { Like: -1 },
      });

      return res.status(200).json({
        liked: false,
      });
    }

    await like.create({
      viewer: userId,
      videoid: videoId,
    });

    const likedVideo = await video.findByIdAndUpdate(
      videoId,
      { $inc: { Like: 1 } },
      { new: true }
    );

    if (likedVideo) {
      try {
        await createActivityNotification({
          recipientId: likedVideo.uploader,
          actorId: userId,
          type: "like",
          subject: likedVideo.videotitle,
        });
      } catch (error) {
        console.error("Unable to create video-like notification:", error);
      }
    }

    return res.status(200).json({
      liked: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getallLikedVideo = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await like
      .find({
        viewer: userId,
      })
      .populate({
        path: "videoid",
        model: "videofiles",
      });

    return res.status(200).json(videos);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};