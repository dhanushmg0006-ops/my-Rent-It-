"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

interface CancelBookingButtonProps {
  reservationId: string;
  paymentAmount: number; // pass reservation.payments[0].amount
}

export default function CancelBookingButton({ reservationId, paymentAmount }: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = useCallback(async () => {
    const reason = prompt("Please enter the reason for cancellation:");
    if (!reason) return toast.error("Reason required");

    try {
      setLoading(true);

      const { data } = await axios.post("/api/refunds", { reservationId, reason });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: paymentAmount * 100,
        currency: "INR",
        name: "Your App Name",
        description: "Refund for cancelled booking",
        order_id: data.orderId,
        handler: async function (response: any) {
          await axios.post("/api/refunds/confirm", {
            reservationId,
            paymentId: data.paymentId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success("Refund successful!");
          router.refresh();
        },
        theme: { color: "#0ea5e9" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [reservationId, paymentAmount, router]);

  return (
    <button disabled={loading} onClick={handleCancel}>
      {loading ? "Processing..." : "Cancel Booking & Refund"}
    </button>
  );
}
