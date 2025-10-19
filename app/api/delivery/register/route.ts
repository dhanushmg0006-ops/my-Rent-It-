import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer"; // for email OTP

export async function POST(req: Request) {
  try {
    const { name, email, phone, password, aadharNumber, bankAccount } = await req.json();

    if (!email || !phone || !password || !name || !aadharNumber || !bankAccount) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save user with OTP (not verified yet)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        hashedPassword,
        aadharNumber,
        bankAccount,
        role: "delivery",
        isVerified: false,
      },
    });

    // Send OTP via email (or you can use SMS service)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Delivery Registration",
      text: `Your OTP is: ${otp}`,
    });

    // Save OTP in memory or a separate table for verification
    // For simplicity, you can save OTP in user session or temporary DB collection

    return NextResponse.json({ message: "OTP sent to email", otp });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to register delivery person" }, { status: 500 });
  }
}
