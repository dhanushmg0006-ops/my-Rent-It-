// app/api/razorpay/verify/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/libs/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔵 [VERIFY] Incoming body:", body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      listingId,
      startDate,
      endDate,
      totalPrice,
      addressId, // MUST be provided
    } = body || {};

    // Basic validations + extra logs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing Razorpay fields.");
      return NextResponse.json({ error: "Missing Razorpay fields" }, { status: 400 });
    }
    if (!userId || !listingId || !startDate || !endDate || !totalPrice) {
      console.error("❌ Missing reservation fields.");
      return NextResponse.json({ error: "Missing reservation fields" }, { status: 400 });
    }

    // addressId is required to create Delivery
    if (!addressId || (typeof addressId !== "string" && typeof addressId !== "object")) {
      console.error("❌ Address is required for delivery. Received:", addressId);
      return NextResponse.json(
        { error: "Address is required for delivery." },
        { status: 400 }
      );
    }

    // Normalize address id (support object with id/_id or raw string)
    const normalizedAddressId =
      typeof addressId === "string" ? addressId : (addressId?.id || addressId?._id);

    if (!normalizedAddressId) {
      console.error("❌ Could not normalize addressId from:", addressId);
      return NextResponse.json(
        { error: "Address is required for delivery." },
        { status: 400 }
      );
    }

    // 1) Verify payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      console.error("❌ Signature mismatch.");
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }
    console.log("✅ Signature verified");

    // 2) Ensure address exists (helps catch bad id)
    const address = await prisma.address.findUnique({
      where: { id: normalizedAddressId },
      select: { id: true, userId: true },
    });
    if (!address) {
      console.error("❌ Address not found:", normalizedAddressId);
      return NextResponse.json(
        { error: "Address not found." },
        { status: 400 }
      );
    }

    // 3) Create Reservation + nested Payment
    const reservation = await prisma.reservation.create({
      data: {
        userId,
        listingId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        payments: {
          create: {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
            amount: totalPrice,
            status: "paid",
            userId,
          },
        },
      },
      include: { payments: true },
    });
    console.log("✅ Reservation created:", reservation.id);

    // 4) Create Delivery (connect reservation + address)
    const delivery = await prisma.delivery.create({
      data: {
        reservation: { connect: { id: reservation.id } },
        address: { connect: { id: normalizedAddressId } },
        status: "pending",
      },
      include: {
        reservation: { include: { listing: true } },
        address: true,
      },
    });
    console.log("✅ Delivery created:", delivery.id);

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      deliveryId: delivery.id,
    });
  } catch (error: any) {
    console.error("🔴 [VERIFY] Fatal error:", error);
    return NextResponse.json(
      { error: "Something went wrong verifying payment", details: error?.message },
      { status: 500 }
    );
  }
}
