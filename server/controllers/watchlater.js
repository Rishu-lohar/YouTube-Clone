import watchlater from "../Models/watchlater.js";

export const handlewatchlater = async (req, res) => {
  try {
    const { userId } = req.body;
    const { videoId } = req.params;

    const existingWatchLater = await watchlater.findOne({
      viewer: userId,
      videoid: videoId,
    });

    if (existingWatchLater) {
      await watchlater.findByIdAndDelete(existingWatchLater._id);

      return res.status(200).json({
        watchlater: false,
      });
    }

    await watchlater.create({
      viewer: userId,
      videoid: videoId,
    });

    return res.status(200).json({
      watchlater: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getallwatchlater = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await watchlater
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