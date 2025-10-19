// app/api/refunds/confirm/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { reservationId, paymentId, razorpayPaymentId, razorpaySignature } = await req.json();

    // Optionally: verify Razorpay signature here

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // Create refund in Razorpay only if paymentId exists
    if (payment.paymentId) {
      await razorpay.payments.refund(payment.paymentId, { amount: payment.amount * 100 });
    }

    // Save refund info in DB
    const refund = await prisma.refund.create({
      data: {
        reservationId,
        paymentId,
        userId: payment.userId,
        reason: "Cancelled booking",
        amount: payment.amount,
        status: "completed",
      },
    });

    return NextResponse.json(refund);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
