import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import getCurrentUser from "@/app/actions/getCurrentUser";

// Simple health check endpoint for debugging
export async function HEAD() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    const userCount = await prisma.user.count();
    await prisma.$disconnect();
    console.log('Database connection successful, user count:', userCount);
    return new Response(JSON.stringify({ status: 'ok', userCount }), { status: 200 });
  } catch (error) {
    console.error('Database connection failed:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Admin deliveries GET endpoint called');

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session found');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('Session found for:', session.user.email);

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    });

    if (!currentUser) {
      console.log('User not found in database');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log('User found:', currentUser.id, 'Role:', currentUser.role);

    if (currentUser.role !== "admin") {
      console.log('User is not admin');
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log('User is admin, proceeding with queries');

    // Get all deliveries for admin view - simplified queries
    let unassignedDeliveries = [], allDeliveries = [], deliveryUsers = [];

    try {
      console.log('Fetching unassigned deliveries...');
      unassignedDeliveries = await prisma.delivery.findMany({
        where: {
          OR: [
            { deliveryPersonId: null }, // Unassigned deliveries
            { status: 'address_required' } // Deliveries needing address setup
          ]
        },
        select: {
          id: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
      });
      console.log('Unassigned deliveries fetched:', unassignedDeliveries.length);
    } catch (error) {
      console.error("Error fetching unassigned deliveries:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    }

    try {
      console.log('Fetching all deliveries...');
      allDeliveries = await prisma.delivery.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: "desc" },
      });
      console.log('All deliveries fetched:', allDeliveries.length);
    } catch (error) {
      console.error("Error fetching all deliveries:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    }

    try {
      console.log('Fetching delivery users...');
      deliveryUsers = await prisma.user.findMany({ where: { role: "delivery" } });
      console.log('Delivery users fetched:', deliveryUsers.length);
    } catch (error) {
      console.error("Error fetching delivery users:", error);
      console.error("Error details:", error instanceof Error ? error.message : 'Unknown error');
    }

    console.log('Admin deliveries API called successfully', {
      unassignedCount: unassignedDeliveries.length,
      allCount: allDeliveries.length,
      deliveryUsersCount: deliveryUsers.length
    });

    return NextResponse.json({
      unassignedDeliveries,
      allDeliveries,
      deliveryUsers,
      totalUnassigned: unassignedDeliveries.length,
      totalDeliveries: allDeliveries.length,
      success: true
    });
  } catch (error) {
    console.error("Unexpected error in admin deliveries GET:", error);
    return NextResponse.json({
      error: "Failed to load admin deliveries",
      unassignedDeliveries: [],
      allDeliveries: [],
      deliveryUsers: [],
      totalUnassigned: 0,
      totalDeliveries: 0
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/admin/deliveries called');

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('No session found in POST');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, id: true }
    });

    if (!currentUser) {
      console.log('User not found in database');
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (currentUser.role !== "admin") {
      console.log('User is not admin');
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.log('Admin user authenticated:', currentUser.id);

    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { deliveryId, deliveryPersonId, userId, appointmentAt, action } = body;

    // Handle special actions first
    if (deliveryId === 'reset-all') {
      await prisma.delivery.updateMany({
        data: { deliveryPersonId: null, status: 'pending' }
      });
      return NextResponse.json({ ok: true, message: 'All deliveries reset to unassigned' });
    }

    if (action === 'update-address' && deliveryId) {
      const { addressId: newAddressId } = await request.json();
      if (!newAddressId) {
        return NextResponse.json({ error: 'Address ID required' }, { status: 400 });
      }

      await prisma.delivery.update({
        where: { id: deliveryId },
        data: {
          addressId: newAddressId,
          status: 'pending' // Change from address_required to pending
        }
      });

      return NextResponse.json({ ok: true, message: 'Delivery address updated' });
    }

    if (deliveryId === 'test-create') {
      const testUser = await prisma.user.findFirst({ where: { role: 'user' } });
      const testListing = await prisma.listing.findFirst();
      const testAddress = await prisma.address.findFirst();

      if (!testUser || !testListing || !testAddress) {
        return NextResponse.json({ error: 'Missing test data' }, { status: 400 });
      }

      const testReservation = await prisma.reservation.create({
        data: {
          userId: testUser.id,
          listingId: testListing.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          totalPrice: 100,
          status: 'active',
        },
      });

      const testDelivery = await prisma.delivery.create({
        data: {
          reservationId: testReservation.id,
          addressId: testAddress.id,
          status: 'pending',
        },
      });

      return NextResponse.json({ testDelivery, testReservation });
    }

    // Main assignment logic - only runs for actual delivery assignments
    if (!deliveryId || !userId) {
      return NextResponse.json({ error: "Missing deliveryId or userId" }, { status: 400 });
    }

    // Validate required fields
    console.log('Assignment request:', { deliveryId, userId, deliveryPersonId });

    if (!deliveryId || !userId) {
      console.log('Missing required fields:', { deliveryId, userId });
      return NextResponse.json({ error: "Missing deliveryId or userId" }, { status: 400 });
    }

    // Find the delivery to assign
    console.log('Looking up delivery:', deliveryId);
    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { reservation: true }
    });

    if (!delivery) {
      console.log('Delivery not found:', deliveryId);
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    console.log('Found delivery:', delivery.id, 'status:', delivery.status);

    // Find the user to assign to
    console.log('Looking up user:', userId);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      console.log('User not found:', userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== 'delivery') {
      console.log('User role is not delivery:', user.role);
      return NextResponse.json({ error: 'Assignee must have delivery role' }, { status: 400 });
    }

    console.log('User is valid delivery user:', user.email);

    // Find or create delivery person record
    console.log('Finding or creating delivery person for user:', userId);
    let dp = await prisma.deliveryPerson.findUnique({ where: { userId } });

    if (!dp) {
      console.log('Creating delivery person for user:', userId);
      try {
        dp = await prisma.deliveryPerson.create({
          data: {
            userId,
            phone: user.phone || 'N/A',
            aadhaarNumber: user.aadharNumber || 'N/A',
            bankAccount: user.bankAccount || 'N/A',
          },
        });
        console.log('Created delivery person:', dp.id);
      } catch (dpError) {
        console.error('Error creating delivery person:', dpError);
        return NextResponse.json({ error: "Failed to create delivery person record", details: dpError instanceof Error ? dpError.message : 'Unknown error' }, { status: 500 });
      }
    } else {
      console.log('Found existing delivery person:', dp.id);
    }

    // Update delivery based on current status
    const updateData: any = {
      deliveryPersonId: dp.id,
      trackingId: appointmentAt ? `appt:${appointmentAt}` : undefined,
    };

    // If delivery needs address setup, change status to pending
    // If already pending, change to dispatched
    if (delivery.status === 'address_required') {
      updateData.status = 'pending';
    } else if (delivery.status === 'pending') {
      updateData.status = 'dispatched';
    }

    console.log('Updating delivery:', deliveryId, 'with data:', updateData);

    try {
      const updated = await prisma.delivery.update({
        where: { id: deliveryId },
        data: updateData,
        include: {
          reservation: { include: { user: true, listing: { include: { user: true } } } },
          address: true,
          deliveryPerson: { include: { user: true } },
        },
      });

      console.log('Delivery updated successfully:', updated.id, 'new status:', updated.status);
      return NextResponse.json(updated);
    } catch (updateError) {
      console.error('Error updating delivery:', updateError);
      console.error('Update data was:', updateData);
      return NextResponse.json({
        error: "Failed to update delivery",
        details: updateError instanceof Error ? updateError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Admin deliveries POST error:", error);
    return NextResponse.json({ error: "Failed to assign delivery" }, { status: 500 });
  }
}


