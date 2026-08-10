import subscription from "../models/subscription.js";
import user from "../models/Auth.js";
import mongoose from "mongoose";
import razorpay from "../lib/razorpay.js";
import crypto from "crypto";

export const createSubscription = async (req, res) => {
    try {
        const { userId, plan, amount } = req.body;

        // Check User id
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Find User
        const existingUser = await user.findById(userId);

        if (!existingUser) {
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
    catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }

    // Create Razorpay order 
    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({
        succes: true,
        order,
    });
};

export const createOrder = async (req, res) => {
    try {
        const { amount, userId } = req.body;

        if (!amount || !userId) {
            request.res.status(400).json({
                success: false,
                message: "Amount and User ID are required",
            });
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            succes: true,
            order,
        });
    }
    catch (error) {
        console.log(error);

        return res.status(500).json({
            success: false,
            message: "Order creation failed",
        });
    }

};

// verifyPayment 
export const verifyPayemnt = async (req, res) => {
    try {
        const {
            razorpay_oder_id,
            razorpay_payemnt_id,
            razorpay_signature,
        } = req.body;

        const body = razorpay_oder_id + "|" + razorpay_payemnt_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if(expectedSignature === razorpay_signature){
            return res.status(200).json({
                success:true,
                message:"Payment verified successfully",
            });
        }
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        })  ;  

    }
    catch(error){
        console.error("Payment verification error: ", error);

        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }


};