import mongoose from "mongoose";

const watchPartySchema = new mongoose.Schema(
    {
        roomCode: {
            type: String,
            required: true,
            uique: true,
        },

        host: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User",
            required: true,
        },

        participants:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        isLive:{
            type: Boolean,
            default: true,
        },
    },
);

export default mongoose.model(
    "WatchPartySchema"
);