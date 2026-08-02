import user from "../models/Auth.js";
import video from "../models/video.js";
import mongoose from "mongoose";
import download from "../models/download.js";

export const downloadVideo = async (req, res)=>{
    try{

        const {videoId} = req.params;
        const {userId} = req.body;

        // Check Video Id
        if (!mongoose.Types.ObjectId.isValid(videoId)){
            return res.status(404).json({
                success:false,
                message: "Video not found",
            });
        }

        // Check User Id
        if (!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(404).json({
                success: false,
                messgae: "User not found",
            });
        }

        // Find Video
        const existingVideo = await video.findById(videoId);

        if(!existingVideo){
            return res.status(404).json({
                success: false,
                message: "Video not found",
            });
        }

        // Find User
        const existingUser = await user.findById(userId);

        if (!existingUser){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check Already Download
        const alreadyDownloaded = await download.findOne({
            userid: userId,
            videoid: videoId, 
        });

        if (alreadyDownloaded){
            return res.status(400).json({
                success: false,
                message: "Video already downloaded",
            });
        }

        // Save Download
        const newDownload = new download({
            userid: userId,
            videoid: videoId,
            plan: existingUser.plan || "Free",
        });

        await newDownload.save();

        return res.status(200).json({
            success: true,
            message: "Video downloaded successfully",
            download: newDownload,
        });  

    }
    catch(error){
        console.error(error);

        return res.status(500).json({
            message: "Somthing went wrong",
        });
    }
};

// Get all videos 

export const getAllDownloads = async (req,res)=>{
    try{
        const {userId} = req.params;

        const downloads = await download.find({
            userid: userId,
        })
        .populate({
            path:"videoid",
            model: "video"
        });
        return res.status(200).json(downloads);
    }
    catch(error){
        console.error(error);

        return res.status(500).json({
            message: "Somthing went wrong",
        });
    }
};
