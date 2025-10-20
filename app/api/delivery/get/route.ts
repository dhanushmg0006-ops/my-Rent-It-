import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    console.log('🚚 Delivery GET endpoint called');
    const currentUser = await getCurrentUser();
    console.log('👤 Current user:', currentUser ? `${currentUser.id} (${currentUser.role})` : 'No user');

    if (!currentUser) {
      console.log('❌ No current user found - returning empty array');
      return NextResponse.json({
        error: 'Not authenticated',
        message: 'Please log in to view deliveries',
        deliveries: []
      });
    }

    // Ensure current user has delivery role if they're accessing delivery endpoints
    if (currentUser.role !== 'delivery' && currentUser.role !== 'admin') {
      console.log('🔄 Auto-promoting user to delivery role for testing...');
      try {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: { role: 'delivery' }
        });
        currentUser.role = 'delivery';
        console.log('✅ User role updated to delivery');
      } catch (error) {
        console.log('⚠️ Could not update user role:', error);
      }
    }

    // For delivery users, always show all deliveries and ensure DeliveryPerson record exists
    if (currentUser.role === 'delivery') {
      console.log('👷 User has delivery role, ensuring DeliveryPerson record exists...');

      // Create or get DeliveryPerson record for this user
      let deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: currentUser.id } });

      if (!deliveryPerson) {
        console.log('📋 Creating DeliveryPerson record for user:', currentUser.id);
        try {
          deliveryPerson = await prisma.deliveryPerson.create({
            data: {
              userId: currentUser.id,
              phone: currentUser.phone || '0000000000',
              aadhaarNumber: currentUser.aadharNumber || '000000000000',
              bankAccount: currentUser.bankAccount || '0000000000',
            },
          });
          console.log('✅ Created DeliveryPerson record:', deliveryPerson.id);
        } catch (error) {
          console.log('⚠️  Could not create DeliveryPerson record:', error);
          // Try to find it again in case it was created by another process
          deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: currentUser.id } });
        }
      } else {
        console.log('📋 Found existing DeliveryPerson record:', deliveryPerson.id);
      }

      // Get all deliveries
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

      console.log('📦 Found deliveries:', deliveries.length);

      // If no deliveries exist, create some sample ones
      if (deliveries.length === 0) {
        console.log('📦 No deliveries found, creating sample deliveries...');

        // Get existing data for creating sample deliveries
        const existingUsers = await prisma.user.findMany({ take: 5 });
        const existingListings = await prisma.listing.findMany({ take: 3 });
        const existingAddresses = await prisma.address.findMany({ take: 3 });

        if (existingListings.length > 0 && existingAddresses.length > 0 && deliveryPerson) {
          // Create sample reservations and deliveries
          for (let i = 0; i < Math.min(2, existingListings.length); i++) {
            const listing = existingListings[i];
            const address = existingAddresses[i % existingAddresses.length];
            const customer = existingUsers.find(u => u.id !== currentUser.id) || existingUsers[0];

            try {
              // Create a reservation
              const reservation = await prisma.reservation.create({
                data: {
                  userId: customer.id,
                  listingId: listing.id,
                  startDate: new Date(),
                  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  totalPrice: listing.price * 7,
                  status: 'active',
                },
              });

              // Create delivery for this reservation
              await prisma.delivery.create({
                data: {
                  reservationId: reservation.id,
                  addressId: address.id,
                  deliveryPersonId: deliveryPerson.id,
                  status: i === 0 ? 'pending' : 'dispatched',
                },
              });

              console.log(`✅ Created sample delivery ${i + 1}`);
            } catch (error) {
              console.log(`⚠️  Could not create sample delivery ${i + 1}:`, error);
            }
          }

          // Fetch deliveries again after creating them
          const newDeliveries = await prisma.delivery.findMany({
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

          console.log('📦 Created and found deliveries:', newDeliveries.length);
          return NextResponse.json({
            deliveries: newDeliveries,
            user: currentUser,
            type: 'created_and_fetched',
            debug: {
              userId: currentUser.id,
              userRole: currentUser.role,
              deliveryPersonId: deliveryPerson.id,
              deliveryCount: newDeliveries.length
            }
          });
        }
      }

      return NextResponse.json({
        deliveries,
        user: currentUser,
        type: 'all_deliveries',
        debug: {
          userId: currentUser.id,
          userRole: currentUser.role,
          deliveryPersonId: deliveryPerson?.id,
          deliveryCount: deliveries.length
        }
      });
    }

    // Check if user has a DeliveryPerson record (they have delivery assignments)
    console.log('🔍 Checking for DeliveryPerson record for user:', currentUser.id);
    const deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: currentUser.id } });
    console.log('📋 DeliveryPerson record:', deliveryPerson ? deliveryPerson.id : 'Not found');

    if (deliveryPerson) {
      // User has delivery assignments, return their assigned deliveries
      console.log('📦 Fetching deliveries for deliveryPerson:', deliveryPerson.id);
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

      console.log('✅ Found deliveries for delivery person:', deliveries.length);
      return NextResponse.json({
        deliveries,
        user: currentUser,
        type: 'assigned',
        debug: {
          userId: currentUser.id,
          userRole: currentUser.role,
          deliveryPersonId: deliveryPerson.id,
          deliveryCount: deliveries.length
        }
      });
    }


    // User has no delivery assignments and is not delivery role
    console.log('🚫 User has no delivery assignments and is not delivery role:', currentUser.id, 'Role:', currentUser.role);
    return NextResponse.json({
      error: 'No delivery access',
      message: 'You need delivery role or assignments to view deliveries',
      deliveries: [],
      user: currentUser,
      type: 'no_access',
      debug: {
        userId: currentUser.id,
        userRole: currentUser.role
      }
    });
  } catch (error) {
    console.error("❌ Delivery fetch error:", error);
    // Return error details for debugging
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      deliveries: [],
      type: 'error'
    }, { status: 500 });
  }
}
