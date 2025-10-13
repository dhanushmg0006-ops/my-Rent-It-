import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import nodemailer from "nodemailer";
import twilio from "twilio";

// Global OTP store
declare global {
  var otpStore: { [key: string]: string } | undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, phone, otp, bankAccount, aadhaar, sendOtp } = body;

    // Initialize OTP store
    globalThis.otpStore = globalThis.otpStore || {};

    // ------------------- 1️⃣ Send OTP -------------------
    if (sendOtp) {
      if (!email && !phone) {
        return NextResponse.json(
          { error: "Email or phone is required" },
          { status: 400 }
        );
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      if (email) globalThis.otpStore[email] = generatedOtp;
      if (phone) globalThis.otpStore[phone] = generatedOtp;

      // Send Email OTP
      if (email) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Delivery Verification",
            text: `Your OTP is: ${generatedOtp}`,
          });
        } catch (err) {
          console.error("Email OTP error:", err);
          return NextResponse.json({ error: "Failed to send Email OTP" }, { status: 500 });
        }
      }

      // Send Phone OTP via Twilio
      if (phone) {
        try {
          const client = twilio(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!
          );

          await client.messages.create({
            body: `Your OTP for delivery verification is: ${generatedOtp}`,
            from: process.env.TWILIO_PHONE_NUMBER!,
            to: `+91${phone}`, // make sure this is a verified number if using trial
          });
        } catch (err: any) {
          console.error("Twilio SMS error:", err);
          return NextResponse.json(
            { error: "Failed to send SMS OTP", details: err.message },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({ message: "OTP sent successfully" });
    }

    // ------------------- 2️⃣ Verify OTP / Update User -------------------
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "delivery") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 1: Email verification
    if (email && otp && !bankAccount && !aadhaar) {
      const storedOtp = globalThis.otpStore[email];
      if (!storedOtp || storedOtp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }
      delete globalThis.otpStore[email];
      return NextResponse.json({ message: "Email verified successfully" });
    }

    // Step 2: Phone + documents verification
    if (phone && otp && bankAccount && aadhaar) {
      const storedOtp = globalThis.otpStore[phone];
      if (!storedOtp || storedOtp !== otp) {
        return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          phone,
          bankAccount,
          aadharNumber: aadhaar,
          isVerified: true,
        },
      });

      delete globalThis.otpStore[phone];
      return NextResponse.json({
        message: "Phone and documents verified successfully",
        user: updatedUser,
      });
    }

    return NextResponse.json(
      { error: "Invalid request or missing fields" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Delivery verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
