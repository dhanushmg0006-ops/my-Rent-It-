import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";
import { sendEmail } from "@/app/libs/email";

interface RequestBody {
  deliveryId: string;
  newStatus: "pending" | "dispatched" | "out-for-delivery" | "delivered";
}

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "delivery") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RequestBody = await req.json();
    const { deliveryId, newStatus } = body;

    if (!deliveryId || !newStatus) {
      return NextResponse.json({ error: "Missing deliveryId or newStatus" }, { status: 400 });
    }

    const delivery = await prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: newStatus },
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

    // Send email notifications
    const renterEmail = delivery.reservation.user.email;
    const lenderEmail = delivery.reservation.listing.user.email;
    const listingTitle = delivery.reservation.listing.title;

    const subject = `Delivery Status Updated: ${listingTitle}`;
    const text = `Hello,\n\nThe delivery status for "${listingTitle}" has been updated to "${newStatus}".\n\nThank you.`;

    if (renterEmail) await sendEmail({ to: renterEmail, subject, text });
    if (lenderEmail) await sendEmail({ to: lenderEmail, subject, text });

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Error updating delivery status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
