"use client";

import axios from "axios";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  listing: any;
  currentUser: any;
  selectedAddress: any; // can be an object or just an ID
  dateRange: { startDate: string; endDate: string };
  totalPrice: number;
}

export default function RazorpayCheckout({
  listing,
  currentUser,
  selectedAddress,
  dateRange,
  totalPrice,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      if (!selectedAddress) {
        alert("❌ Please select a delivery address before paying.");
        return;
      }

      setLoading(true);

      // 1️⃣ Create order on backend
      const orderRes = await axios.post("/api/payment", {
        amount: totalPrice,
      });

      const { id: order_id, currency, amount } = orderRes.data;

      // 2️⃣ Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "RentPal",
        description: listing?.title,
        image: listing?.imageSrc,
        order_id,
        handler: async function (response: any) {
          // 🟢 Ensure we always send an addressId string
          const addressId =
            typeof selectedAddress === "string"
              ? selectedAddress
              : selectedAddress?.id;

          if (!addressId) {
            alert("❌ No valid address found, cannot complete payment.");
            return;
          }

          const body = {
            ...response,
            userId: currentUser?.id,
            listingId: listing?.id,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            totalPrice,
            addressId, // 👈 required for delivery
          };

          console.log("🟢 Sending verify body (frontend):", body);

          await axios.post("/api/razorpay/verify", body);
          alert("✅ Payment successful & Delivery created!");
        },
        prefill: {
          name: currentUser?.name,
          email: currentUser?.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong during payment!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
