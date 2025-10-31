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
      select: {
        id: true,
        status: true,
        addressId: true,
        deliveryPerson: {
          include: {
            user: true,
          },
        },
        reservation: {
          select: {
            id: true,
            listingId: true,
            startDate: true,
            endDate: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!deliveries.length) {
      return NextResponse.json([]);
    }

    const listingIds = Array.from(
      new Set(deliveries.map((d) => d.reservation.listingId).filter(Boolean))
    );
    const addressIds = Array.from(
      new Set(deliveries.map((d) => d.addressId).filter(Boolean))
    );

    const [listings, addresses] = await Promise.all([
      listingIds.length
        ? prisma.listing.findMany({
            where: { id: { in: listingIds } },
            select: { id: true, title: true, imageSrc: true },
          })
        : Promise.resolve([]),
      addressIds.length
        ? prisma.address.findMany({
            where: { id: { in: addressIds } },
            select: {
              id: true,
              street: true,
              city: true,
              state: true,
              postalCode: true,
              country: true,
              phone: true,
            },
          })
        : Promise.resolve([]),
    ]);

    const listingMap = new Map(listings.map((l) => [l.id, l]));
    const addressMap = new Map(addresses.map((a) => [a.id, a]));

    const safeDeliveries = deliveries.map((delivery) => {
      const listing = listingMap.get(delivery.reservation.listingId) || {
        id: delivery.reservation.listingId,
        title: "Listing unavailable",
        imageSrc: "/images/placeholder.jpg",
      };

      const address = delivery.addressId
        ? addressMap.get(delivery.addressId) || {
            id: delivery.addressId,
            street: "Address pending",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phone: "",
          }
        : {
            id: null,
            street: "Address pending",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            phone: "",
          };

      return {
        ...delivery,
        reservation: {
          ...delivery.reservation,
          listing,
        },
        address,
      };
    });

    return NextResponse.json(safeDeliveries);
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
