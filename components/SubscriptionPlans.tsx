"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Script from "next/script";

declare global{
    interface Window{
        Razorpay: any;
    }
}

export default function SubscriptionPlans() {

    const { user } = useUser();

    const handleSubscribe = async () => {
        if (!user) return;

        try {
            const res = await axiosInstance.post("/subscription/create-order", {
                amount: 99,
                userId: user._id,
            });

            console.log("Razorpay Order: ", res.data.order);

            const options={
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: res.data.order.amount,
                Currency: res.data.order.currency,
                name: "YouTube Clone",
                description: "Premium Subscription",
                order_id: res.data.order.id,

                handler: function (response: any){
                    console.log("Payment successful: ", response);
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        }
        catch (error) {
            console.error("Subscription error: ", error);
        }
    };


    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />


            <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto p-6">

                {/* Free Plan */}
                <div className="rounded-xl border p-6">
                    <h2 className="text-xl font-semibold">Free</h2>

                    <p className="mt-2 text-3xl font-bold"> ₹0</p>

                    <p className="mt-2 text-gray-600">Basic access to the platform</p>

                    <Button className="mt-6 w-full">Current Plan</Button>
                </div>

                {/* Premium Plan */}

                <div className="rounded-xl border p-6">

                    <h2 className="text-xl font-semibold"> Premium</h2>

                    <p className="mt-2 text-3xl font-bold">
                        ₹99
                        <span className="text-sm font-normal">/month</span>
                    </p>

                    <p className="mt-2 text-gray-600">
                        Unlock premium features and benefits.
                    </p>

                    <Button
                        className="mt-6 w-full"
                        onClick={handleSubscribe}
                    >
                        Subscribe
                    </Button>
                </div>

            </div>
        </>
    );
}