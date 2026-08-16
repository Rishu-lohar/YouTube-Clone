import cron from "node-cron";
import subscription from "../models/subscription.js";
import user from "../models/Auth.js";

// Runs every day at 12:00 AM
cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Running Subscription Expiry Cron...");

  try {
    // Find all expired subscriptions
    const expiredSubscriptions = await subscription.find({
      status: "Success",
      expiryDate: { $lt: new Date() },
    });

    if (expiredSubscriptions.length === 0) {
      console.log("✅ No expired subscriptions found.");
      return;
    }

    for (const sub of expiredSubscriptions) {
      // Mark subscription as expired
      sub.status = "Expired";
      await sub.save();

      // Downgrade user to Free plan
      await user.findByIdAndUpdate(sub.userid, {
        plan: "Free",
      });

      console.log(
        `✅ User ${sub.userid} downgraded to Free`
      );
    }

    console.log(
      `🎉 ${expiredSubscriptions.length} subscription(s) expired successfully.`
    );
  } catch (error) {
    console.error("❌ Subscription Cron Error:", error);
  }
});