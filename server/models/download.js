import mongoose from "mongoose";


const downloadSchema = new mongoose.Schema(
    {
        // download by
        userid:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
            required: true,
        },

        // Which Video
        videoid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "videofiles",
            required: true,
        },

        // Users current Plan
        plan: {
            type: String,
            enum: ["Free", "Bronze", "Silver", "Gold"],
            default: "Free",
        },

        // date of download
        downloadedAt:{
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("download", downloadSchema);