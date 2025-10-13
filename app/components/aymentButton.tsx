"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutProps {
  userId: string;
  listingId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  addressId: string; // ✅ added
}

export default function CheckoutButton({
  userId,
  listingId,
  startDate,
  endDate,
  totalPrice,
  addressId,
}: CheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create Razorpay order from backend
      const orderRes = await axios.post("/api/payment", {
        amount: totalPrice * 100, // Razorpay expects paise
      });

      const { orderId, key } = orderRes.data;

      // 2️⃣ Open Razorpay payment window
      const options = {
        key,
        amount: totalPrice * 100,
        currency: "INR",
        name: "Rent-It",
        description: "Complete your reservation",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            // 3️⃣ Verify payment + create reservation + delivery
            const verifyRes = await axios.post("/api/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId,
              listingId,
              startDate,
              endDate,
              totalPrice,
              addressId, // ✅ VERY IMPORTANT
            });

            if (verifyRes.data.success) {
              toast.success("Reservation & Delivery created!");
            } else {
              toast.error("Reservation failed");
            }
          } catch (err) {
            toast.error("Verification failed");
          }
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Payment init failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      disabled={loading}
      onClick={handlePayment}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
