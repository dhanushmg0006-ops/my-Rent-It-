import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { sendEmail } from "@/app/libs/email";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch deliveries for this user
    const deliveries = await prisma.delivery.findMany({
      where: {
        reservation: {
          userId: currentUser.id,
        },
      },
      include: {
        reservation: {
          include: {
            listing: true, // product details
            user: true, // to ensure we have the user
          },
        },
        address: true, // delivery address
        deliveryPerson: {
          include: {
            user: true, // delivery person details
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Deliveries error:", error);
    return NextResponse.json(
      { error: "Failed to load deliveries" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deliveryId, newStatus } = body;

    if (!deliveryId || !newStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update the delivery status with included relations for email notifications
    const updatedDelivery = await prisma.delivery.update({
      where: {
        id: deliveryId,
      },
      data: {
        status: newStatus,
      },
      include: {
        reservation: {
          include: {
            user: true, // renter
            listing: { include: { user: true } }, // lender
          },
        },
        address: true,
      },
    });

    // Send email notifications to both renter and lender
    const renterEmail = updatedDelivery.reservation.user.email;
    const lenderEmail = updatedDelivery.reservation.listing.user.email;
    const listingTitle = updatedDelivery.reservation.listing.title;

    const subject = `Delivery Status Updated: ${listingTitle}`;
    const text = `Hello,\n\nThe delivery status for "${listingTitle}" has been updated to "${newStatus}".\n\nThank you.`;

    if (renterEmail) await sendEmail({ to: renterEmail, subject, text });
    if (lenderEmail) await sendEmail({ to: lenderEmail, subject, text });

    return NextResponse.json(updatedDelivery);
  } catch (error) {
    console.error("Update delivery error:", error);
    return NextResponse.json(
      { error: "Failed to update delivery status" },
      { status: 500 }
    );
  }
}
