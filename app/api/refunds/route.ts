import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { reservationId, reason, paymentId } = await req.json();

    if (!reservationId || !reason || !paymentId)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { payments: true },
    });

    if (!reservation)
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });

    const payment = reservation.payments?.find(p => p.paymentId === paymentId);
    if (!payment || !payment.paymentId)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });

    // ✅ Automatically create refund in Razorpay
    const refund = await razorpay.payments.refund(payment.paymentId as string, {
      amount: payment.amount * 100, // amount in paise
      notes: { reason },
    });

    // Save refund in database
    await prisma.refund.create({
      data: {
        paymentId: payment.id,
        reservationId: reservation.id,
        userId: reservation.userId,
        reason,
        amount: payment.amount,
        status: "completed",
      },
    });

    // ✅ Mark reservation as cancelled
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "cancelled" }, // make sure you added `status` field in Reservation model
    });

    return NextResponse.json({ message: "Refund successful and reservation cancelled", refund });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
