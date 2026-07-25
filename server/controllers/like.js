import video from "../Models/video.js";
import like from "../Models/like.js";

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

    await video.findByIdAndUpdate(videoId, {
      $inc: { Like: 1 },
    });

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