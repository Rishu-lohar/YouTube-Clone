import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {

    // other User Comment 
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    // Comment on any video
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },

    // Comment Text 
    commentbody: {
      type: String,
      required: true,
      trim: true,
    },

    // User who made the comment
    usercommented: {
      type: String,
      required: true,
    },

    // Language of the comment
    language:{
      type: String,
      default: "en",
    },

    // User who liked the comment
    likes:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      }
    ],

    // User who disliked the comment
    dislikes:[
      {
      type: mongoose.Schema.Types.ObjectId,
      ref:"user",
      }
    ],

    // Reported Details
    reported: [
      {
        user:{
          type: mongoose.Schema.Types.ObjectId,
          ref:"user", 
        },

        reason: {
          type: String,
          default:"Reported",
        },

        reportedAt:{
          type: Date,
          default: Date.now,
        },
      },
    ],


    // Comment is Visible or gone in review
    status:{
      type: String,
      enum:["active", "flagged"],
      default: "active",
    },

    // Date when the comment was made
    commentedon: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("comment", commentSchema);