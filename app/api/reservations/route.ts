import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, startDate, endDate, totalPrice, addressId } = body;

    if (!listingId || !startDate || !endDate || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // First check if the listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Create reservation directly
    const createdReservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        status: "active",
      },
      include: {
        user: true,
        listing: true,
        payments: true,
        refunds: true,
      },
    });

    console.log('Reservation created successfully:', {
      id: createdReservation.id,
      userId: createdReservation.userId,
      listingId: createdReservation.listingId,
      totalPrice: createdReservation.totalPrice
    });

    // Auto-create delivery for this reservation
    try {
      console.log('Found reservation for delivery creation:', createdReservation.id);
      let resolvedAddressId = addressId as string | undefined;
      if (!resolvedAddressId) {
        const latestAddress = await prisma.address.findFirst({
          where: { userId: currentUser.id },
          orderBy: { createdAt: 'desc' },
        });
        resolvedAddressId = latestAddress?.id;
      }

      // Check if delivery already exists for this reservation
      const existingDelivery = await prisma.delivery.findUnique({
        where: { reservationId: createdReservation.id },
      });

      if (!existingDelivery) {
        // Create delivery as unassigned (deliveryPersonId: null) for admin assignment
        console.log('Creating unassigned delivery for reservation:', createdReservation.id, 'address:', resolvedAddressId || 'none');

        // If no address, create delivery anyway but mark as requiring address
        const deliveryStatus = resolvedAddressId ? 'pending' : 'address_required';

        const deliveryData: any = {
          reservationId: createdReservation.id,
          status: deliveryStatus,
          deliveryPersonId: null, // Leave unassigned for admin assignment
        };

        // Only include addressId if it exists
        if (resolvedAddressId) {
          deliveryData.addressId = resolvedAddressId;
        }

        const newDelivery = await prisma.delivery.create({
          data: deliveryData,
        });
        console.log('Unassigned delivery created successfully:', newDelivery.id, 'status:', deliveryStatus);
      } else {
        console.log('Delivery already exists for reservation:', createdReservation.id);
      }
    } catch (e) {
      console.error('Auto-delivery create failed', e);
      // Non-fatal: reservation still created
    }

    return NextResponse.json(createdReservation);
  } catch (error) {
    console.error("Reservation creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
