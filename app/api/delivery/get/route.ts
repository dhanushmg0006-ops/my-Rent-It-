import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    console.log('Delivery GET endpoint called');
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser ? currentUser.id : 'No user');

    if (!currentUser) {
      // Gracefully return empty list to avoid client error toasts
      console.log('No current user found');
      return NextResponse.json([]);
    }

    // Check if user has a DeliveryPerson record (they have delivery assignments)
    console.log('Checking for DeliveryPerson record for user:', currentUser.id);
    const deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: currentUser.id } });
    console.log('DeliveryPerson record:', deliveryPerson ? deliveryPerson.id : 'Not found');

    if (deliveryPerson) {
      // User has delivery assignments, return their assigned deliveries
      console.log('Fetching deliveries for deliveryPerson:', deliveryPerson.id);
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
      console.log('User has delivery role but no DeliveryPerson record, showing all deliveries');
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
    console.log('User has no delivery assignments and is not delivery role:', currentUser.id, 'Role:', currentUser.role);
    return NextResponse.json([]);
  } catch (error) {
    console.error("Delivery fetch error:", error);
    // Fail-open with empty array to keep UI working
    return NextResponse.json([]);
  }
}
