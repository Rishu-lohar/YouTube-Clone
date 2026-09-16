import ChannelSubscription from "../models/channelSubscription.js";
import User from "../Models/Auth.js";

// Subscribe
export const subscribe = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.body;

    if (!subscriberId || !channelId) {
      return res.status(400).json({
        success: false,
        message: "Subscriber ID and Channel ID are required",
      });
    }

    if (subscriberId === channelId) {
      return res.status(400).json({
        success: false,
        message: "You cannot subscribe to your own channel",
      });
    }

    const channel = await User.findById(channelId);

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found",
      });
    }

    const existing = await ChannelSubscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Already subscribed",
      });
    }

    await ChannelSubscription.create({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res.status(201).json({
      success: true,
      subscribed: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Subscription failed",
    });
  }
};

// Unsubscribe
export const unsubscribe = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.body;

    await ChannelSubscription.findOneAndDelete({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res.status(200).json({
      success: true,
      subscribed: false,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unsubscribe failed",
    });
  }
};

// Check subscription status
export const getSubscriptionStatus = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.query;

    const subscription = await ChannelSubscription.findOne({
      subscriber: subscriberId,
      channel: channelId,
    });

    return res.status(200).json({
      success: true,
      subscribed: !!subscription,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to check subscription",
    });
  }
};

// Get subscriber count
export const getSubscriberCount = async (req, res) => {
  try {
    const { channelId } = req.params;

    const count = await ChannelSubscription.countDocuments({
      channel: channelId,
    });

    return res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to get subscriber count",
    });
  }
};

// Get my subscribed channels
export const getMySubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    const subscriptions = await ChannelSubscription.find({
      subscriber: userId,
    })
      .populate(
        "channel",
        "name channelname image description"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to get subscribed channels",
    });
  }
};