import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import Razorpay from "razorpay";

const hasRazorpayCredentials = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

const razorpay = hasRazorpayCredentials
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

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

    let refundResult: any = null;
    let refundStatus: "completed" | "pending" = "completed";

    if (hasRazorpayCredentials && razorpay) {
      try {
        refundResult = await razorpay.payments.refund(payment.paymentId as string, {
          amount: payment.amount * 100, // amount in paise
          notes: { reason },
        });
      } catch (gatewayError) {
        console.error("Razorpay refund failed:", gatewayError);
        refundStatus = "pending";
      }
    } else {
      console.warn("Razorpay credentials missing. Creating offline refund record.");
      refundStatus = "pending";
    }

    // Save refund in database
    await prisma.refund.create({
      data: {
        paymentId: payment.id,
        reservationId: reservation.id,
        userId: reservation.userId,
        reason,
        amount: payment.amount,
        status: refundStatus,
      },
    });

    // ✅ Mark reservation as cancelled
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "cancelled" }, // make sure you added `status` field in Reservation model
    });

    return NextResponse.json({
      message:
        refundStatus === "completed"
          ? "Refund successful and reservation cancelled"
          : "Reservation cancelled. Refund will be processed manually.",
      refund: refundResult,
    });
  } catch (err) {
    console.error("Refund error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
