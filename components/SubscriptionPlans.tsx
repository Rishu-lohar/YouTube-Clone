"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPlans() {
  const { user } = useUser();

  const [currentPlan, setCurrentPlan] = useState<
    "Free" | "Bronze" | "Silver" | "Gold"
  >("Free");

  const [loadingStatus, setLoadingStatus] = useState(true);

  const plans = [
    {
      name: "Free",
      price: 0,
      features: [
        "480p Streaming",
        "Ads Included",
        "Basic Access",
      ],
    },
    {
      name: "Bronze",
      price: 99,
      features: [
        "720p HD Streaming",
        "Video Downloads",
        "Priority Support",
      ],
    },
    {
      name: "Silver",
      price: 199,
      features: [
        "1080p Full HD",
        "Ad-Free Experience",
        "Unlimited Downloads",
      ],
    },
    {
      name: "Gold",
      price: 299,
      features: [
        "4K Streaming",
        "Offline Downloads",
        "Premium Support",
      ],
    },
  ];

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setCurrentPlan("Free");
      setLoadingStatus(false);
      return;
    }

    try {
      const res = await axiosInstance.get(
        `/subscription/status/${user._id}`
      );

      if (res.data.subscription) {
        setCurrentPlan(res.data.subscription.plan);
      } else {
        setCurrentPlan("Free");
      }
    } catch (err) {
      console.error(err);
      setCurrentPlan("Free");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  const handleSubscribe = async (
    plan: string,
    amount: number
  ) => {
    if (!user) return;

    try {
      const res = await axiosInstance.post(
        "/subscription/create-order",
        {
          userId: user._id,
          plan,
          amount,
        }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: res.data.order.amount,
        currency: res.data.order.currency,
        name: "YouTube Clone",
        description: `${plan} Subscription`,
        order_id: res.data.order.id,

        handler: async function (response: any) {
          try {
            await axiosInstance.post(
              "/subscription/verify-payment",
              {
                razorpay_order_id:
                  response.razorpay_order_id,
                razorpay_payment_id:
                  response.razorpay_payment_id,
                razorpay_signature:
                  response.razorpay_signature,
                userId: user._id,
                plan,
                amount,
              }
            );

            await fetchSubscriptionStatus();
          } catch (error) {
            console.error("Verification Error:", error);
          }
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Subscription Error:", error);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto p-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-6 shadow-md transition hover:shadow-xl ${
              currentPlan === plan.name
                ? "border-red-500"
                : ""
            }`}
          >
            <h2 className="text-2xl font-bold">
              {plan.name}
            </h2>

            <p className="mt-3 text-3xl font-bold">
              ₹{plan.price}
              {plan.price !== 0 && (
                <span className="text-sm font-normal">
                  /month
                </span>
              )}
            </p>

            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              {plan.features.map((feature) => (
                <li key={feature}>✅ {feature}</li>
              ))}
            </ul>

            <Button
              className="mt-6 w-full"
              disabled={
                loadingStatus ||
                currentPlan === plan.name
              }
              onClick={() => {
                if (plan.price > 0) {
                  handleSubscribe(
                    plan.name,
                    plan.price
                  );
                }
              }}
            >
              {loadingStatus
                ? "Loading..."
                : currentPlan === plan.name
                ? "Current Plan"
                : plan.price === 0
                ? "Free Plan"
                : "Upgrade"}
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}