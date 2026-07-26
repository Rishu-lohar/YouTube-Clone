import video from "../Models/video.js";
import history from "../Models/history.js";

export const handlehistory = async (req, res) => {
  try {
    const { userId } = req.body;
    const { videoId } = req.params;

    await history.create({
      viewer: userId,
      videoid: videoId,
    });

    await video.findByIdAndUpdate(videoId, {
      $inc: {
        views: 1,
      },
    });

    return res.status(200).json({
      history: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const handleview = async (req, res) => {
  try {
    const { videoId } = req.params;

    await video.findByIdAndUpdate(videoId, {
      $inc: {
        views: 1,
      },
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getallhistoryVideo = async (req, res) => {
  try {
    const { userId } = req.params;

    const videos = await history
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

export const deletehistory = async (req, res) => {
  try {
    const { id } = req.params;
    await history.findByIdAndDelete(id);
    return res.status(200).json({ history: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};