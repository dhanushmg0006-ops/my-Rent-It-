import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      // Gracefully return empty list to avoid client error toasts
      return NextResponse.json([]);
    }

    // Check if user has a DeliveryPerson record (they have delivery assignments)
    const deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: currentUser.id } });

    if (deliveryPerson) {
      // User has delivery assignments, return their assigned deliveries
      const deliveries = await prisma.delivery.findMany({
        where: { deliveryPersonId: deliveryPerson.id },
        include: {
          reservation: {
            include: {
              listing: true,
              user: true, // renter
            },
          },
          address: true,
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

      console.log('Found deliveries for delivery person:', deliveries.length);
      return NextResponse.json(deliveries);
    }

    // If user is a delivery-role user but no DeliveryPerson record, show all deliveries
    if (currentUser.role === 'delivery') {
      const deliveries = await prisma.delivery.findMany({
        include: {
          reservation: {
            include: {
              listing: true,
              user: true, // renter
            },
          },
          address: true,
          deliveryPerson: {
            include: {
              user: true, // delivery person details
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      console.log('Delivery role user with no assignments, showing all deliveries:', deliveries.length);
      return NextResponse.json(deliveries);
    }

    // User has no delivery assignments and is not delivery role
    console.log('User has no delivery assignments:', currentUser.id);
    return NextResponse.json([]);
  } catch (error) {
    console.error("Delivery fetch error:", error);
    // Fail-open with empty array to keep UI working
    return NextResponse.json([]);
  }
}
