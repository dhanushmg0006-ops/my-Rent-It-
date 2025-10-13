"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryVerifyPage() {
  const [step, setStep] = useState(1);

  // Step 1: Email
  const [email, setEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Step 2: Phone + documents
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [bankAccount, setBankAccount] = useState("");

  const router = useRouter();

  // Send OTP (email or phone)
  const sendOtp = async (type: "email" | "phone") => {
    const payload =
      type === "email" ? { email, sendOtp: true } : { phone, sendOtp: true };

    const res = await fetch("/api/delivery/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    alert(data.message || data.error);
  };

  // Step 1: Verify email OTP
  const verifyEmailOtp = async () => {
    if (!email || !emailOtp) {
      alert("Please enter email and OTP");
      return;
    }

    const res = await fetch("/api/delivery/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: emailOtp }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Email verified!");
      setStep(2);
    } else {
      alert(data.error);
    }
  };

  // Step 2: Verify phone OTP + documents
  const completeVerification = async () => {
    if (!phone || !phoneOtp || !aadhaar || !bankAccount) {
      alert("All fields are required");
      return;
    }

    const res = await fetch("/api/delivery/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        otp: phoneOtp,
        aadhaar,
        bankAccount,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("🎉 Phone and documents verified successfully!");
      router.push("/delivery-dashboard"); // Redirect after verification
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto space-y-6">
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 1: Verify Email</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="border p-2 w-full"
          />
          <button
            onClick={() => sendOtp("email")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send OTP
          </button>
          <input
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value)}
            placeholder="Enter OTP"
            className="border p-2 w-full"
          />
          <button
            onClick={verifyEmailOtp}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Verify Email
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Step 2: Phone & Documents</h2>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number (10 digits)"
            className="border p-2 w-full"
          />
          <button
            onClick={() => sendOtp("phone")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send OTP
          </button>
          <input
            value={phoneOtp}
            onChange={(e) => setPhoneOtp(e.target.value)}
            placeholder="Phone OTP"
            className="border p-2 w-full"
          />
          <input
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            placeholder="Aadhaar Number"
            className="border p-2 w-full"
          />
          <input
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder="Bank Account Number"
            className="border p-2 w-full"
          />
          <button
            onClick={completeVerification}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Complete Verification
          </button>
        </div>
      )}
    </div>
  );
}
