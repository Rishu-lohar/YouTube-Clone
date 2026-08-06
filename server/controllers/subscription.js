import subscription from "../models/subscription";
import user from "../models/Auth.js";
import mongoose from "mongoose";
import razorpay from "../lib/razorpay.js";

export const createSubscription = async (req,res) =>{
    try{
        const {userId, plan, amount} = req.body;

        // Check User id
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find User
        const existingUser = await user.findById(userId);

        if (!existingUser){
            return res.status(404).json({
                success: false,
                message: " User not found",
            });
        }
        return res.status(200).json({
            success: true,
            message: "User verified successfully",
        });
    }
    catch(error){
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }

    // Create Razorpay order 
    const options = {
        amount: amount*100,
        currency: "INR",
        receipt:  `receipt_${Date.now}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
        succes: true,
        order,
    });
};