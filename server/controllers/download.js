import user from "../models/Auth.js";
import video from "../models/video.js";
import mongoose from "mongoose";
import download from "../models/download.js";
import subscription from "../models/subscription.js";

export const downloadVideo = async (req, res) => {
    try {

        const { videoId } = req.params;
        const { userId } = req.body;

        // Check Video Id
        if (!mongoose.Types.ObjectId.isValid(videoId)) {
            return res.status(404).json({
                success: false,
                message: "Video not found",
            });
        }

        // Check User Id
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find Video
        const existingVideo = await video.findById(videoId);

        if (!existingVideo) {
            return res.status(404).json({
                success: false,
                message: "Video not found",
            });
        }

        // Find User
        const existingUser = await user.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Get Active Subscription
        const activeSubscription = await subscription.findOne({
            userid: userId,
            status: "Success",
            expiryDate: { $gt: new Date() },
        }).sort({ expiryDate: -1 });

        const currentPlan = activeSubscription
            ? activeSubscription.plan
            : "Free";

        // Already Downloaded
        const alreadyDownloaded = await download.findOne({
            userid: userId,
            videoid: videoId,
        });

        if (alreadyDownloaded) {
            return res.status(400).json({
                success: false,
                message: "Video already downloaded",
            });
        }

        // Premium Video Restriction
        if (existingVideo.isPremium && currentPlan === "Free") {
            return res.status(403).json({
                success: false,
                message: "Upgrade your subscription to download premium videos.",
            });
        }

        // Daily Download Limit (Free Users)
        if (currentPlan === "Free") {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const downloadCount = await download.countDocuments({
                userid: userId,
                createdAt: { $gte: today },
            });

            if (downloadCount >= 5) {
                return res.status(403).json({
                    success: false,
                    message: "Daily download limit reached. Upgrade your plan.",
                });
            }
        }

        // Save Download
        const newDownload = await download.create({
            userid: userId,
            videoid: videoId,
            plan: currentPlan,
        });

        return res.status(200).json({
            success: true,
            message: "Video downloaded successfully",
            download: newDownload,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Get All Downloads

export const getAllDownloads = async (req, res) => {
    try {

        const { userId } = req.params;

        const downloads = await download.find({
            userid: userId,
        }).populate({
            path: "videoid",
            model: "videofiles",
        });

        return res.status(200).json(downloads);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};