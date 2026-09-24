import mongoose from "mongoose";

const videoSchema = mongoose.Schema(
  {
    videotitle: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    filetype: {
      type: String,
      required: true,
    },

    filepath: {
      type: String,
      required: true,
    },

    filesize: {
      type: String,
      required: true,
    },

    videochanel: {
      type: String,
      required: true,
    },

    Like: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    uploader: {
      type: String,
    },


    isPremium: {
      type: Boolean,
      default: false,
    },

    reported: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        reason: {
          type: String,
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Video =
  mongoose.models.videofiles ||
  mongoose.model("videofiles", videoSchema);

export default Video;