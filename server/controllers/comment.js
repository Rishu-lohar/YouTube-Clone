
import comment from "../Models/comment.js";
import mongoose from "mongoose";

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