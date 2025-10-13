// app/components/payments/RazorpayCheckout.tsx
"use client";

import axios from "axios";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  listing: any;
  currentUser: any;
  selectedAddress: any; // ID string or object with id/_id
  dateRange: { startDate: Date; endDate: Date };
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

  // Ensure Razorpay script is present
  useEffect(() => {
    const src = "https://checkout.razorpay.com/v1/checkout.js";
    if (typeof window !== "undefined" && !document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePayment = async () => {
    try {
      // Normalize selectedAddress to an ID
      const addressId =
        typeof selectedAddress === "string"
          ? selectedAddress
          : selectedAddress?.id || selectedAddress?._id;

      console.log("🟡 selectedAddress passed into checkout:", selectedAddress);
      console.log("🟡 normalized addressId:", addressId);

      if (!addressId) {
        alert("❌ Please select a delivery address before paying.");
        return;
      }
      if (!currentUser?.id) {
        alert("❌ You must be logged in.");
        return;
      }

      setLoading(true);

      // 1) Create order on backend
      const orderRes = await axios.post("/api/payment", { amount: totalPrice });
      const { id: order_id, currency, amount } = orderRes.data;

      // 2) Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "RentPal",
        description: listing?.title || "Reservation Payment",
        image: listing?.imageSrc,
        order_id,
        handler: async function (response: any) {
          const payload = {
            ...response, // { razorpay_order_id, razorpay_payment_id, razorpay_signature }
            userId: currentUser?.id,
            listingId: listing?.id,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            totalPrice,
            addressId, // 👈 IMPORTANT
          };

          console.log("🟢 Sending verify body (frontend):", payload);

          await axios.post("/api/razorpay/verify", payload);
          alert("✅ Payment successful! Reservation & Delivery created.");
          // You can redirect to /delivery or /bookings here if you want.
        },
        prefill: {
          name: currentUser?.name || "",
          email: currentUser?.email || "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please refresh and try again.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("🔴 Payment flow error:", error);
      alert(error?.response?.data?.error || "Something went wrong during payment!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="bg-blue-600 text-white px-4 py-2 rounded w-full"
    >
      {loading ? "Processing..." : "Pay Now"}
    </button>
  );
}
