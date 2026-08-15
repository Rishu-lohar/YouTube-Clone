import subscription from "../models/subscription.js";
import user from "../models/Auth.js";
import mongoose from "mongoose";
import razorpay from "../lib/razorpay.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js";
import generateInvoice from "../utils/generateInvoice.js";

// Create Subscription
export const createSubscription = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const existingUser = await user.findById(userId);

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User verified successfully",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};

// Create Razorpay Order
export const createOrder = async (req, res) => {
    try {
        const { plan, amount, userId } = req.body;

        if (!plan || !amount || !userId) {
            return res.status(400).json({
                success: false,
                message: "Plan, Amount and User ID are required",
            });
        }

        const validPlans = {
            Bronze: 99,
            Silver: 199,
            Gold: 299,
        };

        if (!validPlans[plan]) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan",
            });
        }

        if (amount !== validPlans[plan]) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount",
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
            plan,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Order creation failed",
        });
    }
};

// Verify Payment
export const verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            userId,
            plan,
            amount,
        } = req.body;

        const body =
            razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        const existingSubscription =
            await subscription.findOne({
                orderId: razorpay_order_id,
            });

        if (existingSubscription) {
            return res.status(400).json({
                success: false,
                message: "Subscription already exists",
            });
        }

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const savedSubscription =
            await subscription.create({
                userid: userId,
                plan,
                amount,
                status: "Success",
                orderId: razorpay_order_id,
                startDate: new Date(),
                expiryDate,
            });

        console.log("Subscription Saved");

        const existingUser = await user.findById(userId);

        if (existingUser?.email) {

            const invoicePath =
                await generateInvoice({
                    name: existingUser.name,
                    email: existingUser.email,
                    plan,
                    amount,
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    startDate:
                        savedSubscription.startDate,
                    expiryDate:
                        savedSubscription.expiryDate,
                });

            await sendEmail({
                to: existingUser.email,

                subject:
                    "Premium Subscription Activated",

                html: `
                <h2>Hello ${existingUser.name}</h2>

                <p>Your <b>${plan}</b> subscription has been activated successfully.</p>

                <hr/>

                <p><b>Plan:</b> ${plan}</p>
                <p><b>Amount:</b> ₹${amount}</p>
                <p><b>Order ID:</b> ${razorpay_order_id}</p>
                <p><b>Payment ID:</b> ${razorpay_payment_id}</p>

                <br/>

                <p>Your invoice is attached with this email.</p>

                <p>Thank you for choosing YouTube Premium ❤️</p>
                `,

                attachments: [
                    {
                        filename: `Invoice-${razorpay_order_id}.pdf`,
                        path: invoicePath,
                    },
                ],
            });

            console.log("Invoice Email Sent");
        }

        return res.status(200).json({
            success: true,
            message:
                "Payment verified successfully",
        });

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Get Current Subscription
export const getMySubscription = async (req, res) => {
    try {

        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        const activeSubscription =
            await subscription
                .findOne({
                    userid: userId,
                    status: "Success",
                    expiryDate: {
                        $gt: new Date(),
                    },
                })
                .sort({
                    expiryDate: -1,
                });

        return res.status(200).json({
            success: true,
            subscription:
                activeSubscription || null,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong",
        });
    }
};