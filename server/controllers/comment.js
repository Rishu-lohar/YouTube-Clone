
import comment from "../models/comment.js";
import mongoose from "mongoose";
import { translate } from "@vitalets/google-translate-api";

import {
  containsBadWords,
  onlySpecialCharacters,
} from "../utils/commentValidation.js";

export const postcomment = async (req, res) => {
  try {

    const { commentbody } = req.body;

    if (!commentbody || commentbody.trim() === "") {
      return res.status(400).json({
        message: "Comment body is required",
      });
    }

    if (commentbody.length > 500) {
      return res.status(400).json({
        message: "Comment is too long",
      });
    }

    if (containsBadWords(commentbody)) {
      return res.status(400).json({
        message: "Comment contains abusive language",
      });
    }

    if (onlySpecialCharacters(commentbody)) {
      return res.status(400).json({
        message: "Invalid comment",
      });
    }

    const newComment = new comment(req.body);

    await newComment.save();

    return res.status(200).json({
      comment: true,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getallcomment = async (req, res) => {
  try {
    const { videoid } = req.params;

    const comments = await comment.find({
      videoid,
    });

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const deletecomment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Comment unavailable");
    }

    await comment.findByIdAndDelete(id);

    return res.status(200).json({
      comment: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const editcomment = async (req, res) => {
  try {
    const { id } = req.params;
    const { commentbody } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).send("Comment unavailable");
    }

    const updatedComment = await comment.findByIdAndUpdate(
      id,
      {
        $set: {
          commentbody,
        },
      },
      {
        new: true,
      }
    );

    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

// Likes
export const likeComment = async(req,res)=>{
  try{
    const {id} = req.params;
    const {userid} = req.body;

    // Check valid comment id
    if (!mongoose.Types.ObjectId.isValid(id)){
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    //Find comment
    const existingComment = await comment.findById(id);

    if (!existingComment){
      return res.status(404).json({
        message:"Comment not found",
      });
    }

    // User already liked..?
    const alreadyLiked = existingComment.likes.includes(userid);

    if (alreadyLiked){

      //unlike
      existingComment.likes.pull(userid);
    }
    else{
      
      //Like
      existingComment.likes.push(userid);

      // Remove dislike if present
      existingComment.dislikes.pull(userid);
    }

    await existingComment.save();

    return res.status(200).json({
      success:true,
      likes:existingComment.likes.length,
      dislikes:existingComment.dislikes.length,
    });
  }
  catch(error){
    console.error(error);

    return res.status(500).json({
      message:"Somthing went wrong",
    });
  }
};


// Dislikes
export const dislikeComment = async(req,res)=>{

  try{

    const {id} = req.params;
    const {userid} = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(404).json({
        message : "Comment not found",
      });
    }

    // Find Comment 
    const existingComment = await comment.findById(id);
    if (!existingComment){
      return res.status(404).json({
        message:"Comment not found",
      })
    }

    // User alrady Liked?
    const alreadyDisliked = existingComment.dislikes.includes(userid);

    if(alreadyDisliked){
      existingComment.dislikes.pull(userid);
    }
    else{

      // Dislike
      existingComment.dislikes.push(userid);

      // Remove like if present
      existingComment.likes.pull(userid);
    }

    await existingComment.save();

    return res.status(200).json({
      success:true,
      likes:existingComment.likes.length,
      dislikes:existingComment.dislikes.length,

    });
    
  }
  catch(error){
    console.error(error);

    return res.status(500).json({
      message:"Something went wrong",
    });
  }
};

// Report 

export const reportComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userid, reason } = req.body;

    const existingComment = await comment.findById(id);

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user already reported
    const alreadyReported = existingComment.reported.find(
      (report) => report.user.toString() === userid
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this comment",
      });
    }

    // Add report
    existingComment.reported.push({
      user: userid,
      reason: reason || "Reported",
    });

    // Auto flag after 5 reports
    if (existingComment.reported.length >= 5) {
      existingComment.status = "flagged";
    }

    await existingComment.save();

    res.status(200).json({
      success: true,
      message: "Comment reported successfully",
      reports: existingComment.reported.length,
      status: existingComment.status,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// Translate Comment

export const translateComment = async (req,res)=>{

  try{
    const {id} = req.params;
    const{targetLanguage} = req.body;

    // Check valid id
    if(!mongoose.Types.ObjectId.isValid(id)){
      return res.status(404).json({
        success:false,
        message:"Comment not found",
      });
    }

    // Find Comment 
    const existingcomment = await comment.findById(id);

    if(!existingcomment){
      return res.status(404).json({
        success:false,
        message:"Comment not found",
      });
    }

    // Translate 
    const translated = await translate(
      existingcomment.commentbody,
      {
        to:targetLanguage,
      }
    );
    return res.status(200).json({
      success:true,
      translatedText:translated.text,
    });
  }
  catch(error){
    console.error(error);

    return res.status(500).json({
      success:false,
      message:"Translation failed",
    });
  }
};