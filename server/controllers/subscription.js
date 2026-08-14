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

};

export const createOrder = async (req, res) => {
    try {
        const { amount, userId } = req.body;

        if (!amount || !userId) {
            return res.status(400).json({
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
            success: true,
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
export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature === razorpay_signature) {

            console.log("✅ Signature Matched");

            const existingSubscription = await subscription.findOne({
                orderId: razorpay_order_id,
            });

            if (existingSubscription) {
                return res.status(400).json({
                    success: false,
                    message: "Subscription already exists",
                });
            }

            // Expiry Date
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);

            console.log("Before Save");

            // Save Subscription
            const savedSubscription = await subscription.create({
                userid: userId,
                plan: "Gold",
                amount: 99,
                status: "Success",
                orderId: razorpay_order_id,
                startDate: new Date(),
                expiryDate: expiryDate,
            });

            console.log("After Save");
            console.log(savedSubscription);

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
            });
        }
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });

    }
    catch (error) {
        console.error("Payment verification error: ", error);

        res.status(500).json({
            success: false,
            message: "internal server error",
        });
    }
};

export const getMySubscription = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const activeSubscription = await subscription
            .findOne({
                userid: userId,
                status: "Success",
                expiryDate: { $gt: new Date() },
            })
            .sort({ expiryDate: -1 });

        return res.status(200).json({
            success: true,
            subscription: activeSubscription || null,
        });
    }
    catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};