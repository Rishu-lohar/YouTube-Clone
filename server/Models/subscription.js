import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        // User who purchased the plan
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required : true,
        },

        // Selected Plan
        plan:{
            type: String,
            enum: ["Bronze", "Silver", "Gold"],
            required: true,
        },

        // Plane Prize
        amount:{
            type: Number,
            required: true,
        },

        // Payment Status
        status:{
            type: String,
            enum: ["Pending", "Success", "Failed"],
            default:"Pending",
        },

        // Razorpay IDs
        orderId:{
            type: String,
        },

        // Plane Dates
        startDate:{
            type: Date,
            default: Date.now,
        },

        // expiryDate
        expiryDate:{
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model('subscription', subscriptionSchema);