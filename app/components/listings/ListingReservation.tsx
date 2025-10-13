'use client';

import { Range } from "react-date-range";
import { useState } from "react";
import Button from "../Button";
import Calendar from "../inputs/Calendar";

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
  listing: any;         // 👈 added listing info
  currentUser: any;     // 👈 added user info
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates,
  listing,
  currentUser
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create order on backend
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert("Failed to create Razorpay order.");
        return;
      }

      // 2️⃣ Load Razorpay
      const res = await loadRazorpay();
      if (!res) {
        alert("Failed to load Razorpay SDK.");
        return;
      }

      // 3️⃣ Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "RentPal",
        description: "Reservation Payment",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 4️⃣ Verify payment & create reservation in DB
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: currentUser?.id,
                listingId: listing?.id,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                totalPrice,
              }),
            });

            const data = await verifyRes.json();
            if (data.success) {
              alert("🎉 Reservation created successfully!");
            } else {
              alert("Payment verified but reservation failed: " + data.error);
            }
          } catch (err) {
            console.error(err);
            alert("Something went wrong verifying payment!");
          }
        },
        prefill: {
          name: currentUser?.name || "Guest",
          email: currentUser?.email || "guest@example.com",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Something went wrong with payment.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Helper to load Razorpay script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">
          $ {price}
        </div>
        <div className="font-light text-neutral-600">day</div>
      </div>
      <hr />
      <Calendar
        value={dateRange}
        disabledDates={disabledDates}
        onChange={(value) => onChangeDate(value.selection)}
      />
      <hr />
      <div className="p-4">
        
      </div>
      <hr />
      <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
        <div>Total</div>
        <div>$ {totalPrice}</div>
      </div>
    </div>
  );
};

export default ListingReservation;
