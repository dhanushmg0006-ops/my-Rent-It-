import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";

export async function GET() {
  try {
    console.log('🚚 Delivery GET endpoint called');

    // For now, return sample deliveries for any request
    // In production, you'd want proper authentication here
    console.log('✅ Creating sample deliveries for testing...');

    // Get any existing user or create a sample one for demo
    let currentUser = await prisma.user.findFirst({
      where: { role: 'delivery' }
    });

    // If no delivery user exists, create a sample one
    if (!currentUser) {
      console.log('📋 No delivery user found, using sample user...');
      currentUser = await prisma.user.findFirst();
    }

    if (!currentUser) {
      console.log('❌ No users found in database');
      return NextResponse.json({
        error: 'No users found',
        message: 'Database is empty',
        deliveries: []
      });
    }

    // Format user object
    const user = {
      ...currentUser,
      createdAt: currentUser.createdAt.toISOString(),
      updatedAt: currentUser.updatedAt.toISOString(),
      emailVerified: currentUser.isVerified || null,
      role: currentUser.role || 'delivery', // Default to delivery role
    };

    console.log('👤 Current user:', `${user.id} (${user.role})`);

    // Ensure current user has delivery role
    if (user.role !== 'delivery' && user.role !== 'admin') {
      console.log('🔄 Auto-promoting user to delivery role for testing...');
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'delivery' }
        });
        user.role = 'delivery';
        console.log('✅ User role updated to delivery');
      } catch (error) {
        console.log('⚠️ Could not update user role:', error);
      }
    }

    // For delivery users, always show all deliveries and ensure DeliveryPerson record exists
    if (user.role === 'delivery' || user.role === 'admin') {
      console.log('👷 User has delivery/admin role, ensuring DeliveryPerson record exists...');

      // Create or get DeliveryPerson record for this user
      let deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: user.id } });

      if (!deliveryPerson) {
        console.log('📋 Creating DeliveryPerson record for user:', user.id);
        try {
          deliveryPerson = await prisma.deliveryPerson.create({
            data: {
              userId: user.id,
              phone: user.phone || '0000000000',
              aadhaarNumber: user.aadharNumber || '000000000000',
              bankAccount: user.bankAccount || '0000000000',
            },
          });
          console.log('✅ Created DeliveryPerson record:', deliveryPerson.id);
        } catch (error) {
          console.log('⚠️ Could not create DeliveryPerson record:', error);
          // Try to find it again in case it was created by another process
          deliveryPerson = await prisma.deliveryPerson.findUnique({ where: { userId: user.id } });
        }
      } else {
        console.log('📋 Found existing DeliveryPerson record:', deliveryPerson.id);
      }

      // Get all deliveries with a simpler query first
      const deliveries = await prisma.delivery.findMany({
        include: {
          reservation: {
            include: {
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

      // For each delivery, get the listing separately to avoid null issues
      const deliveriesWithListings = await Promise.all(
        deliveries.map(async (delivery) => {
          if (!delivery.reservation) return null;

          const listing = await prisma.listing.findUnique({
            where: { id: delivery.reservation.listingId }
          });

          return {
            ...delivery,
            reservation: {
              ...delivery.reservation,
              listing: listing || null
            }
          };
        })
      );

      // Filter out null results
      const validDeliveries = deliveriesWithListings.filter(d => d !== null && d.reservation?.listing);

      console.log('📦 Found deliveries:', validDeliveries.length);

      // If no valid deliveries exist, create some sample ones
      if (validDeliveries.length === 0) {
        console.log('📦 No deliveries found, creating sample deliveries...');

        // Get existing data for creating sample deliveries
        const existingUsers = await prisma.user.findMany({ take: 5 });
        const existingListings = await prisma.listing.findMany({ take: 3 });
        const existingAddresses = await prisma.address.findMany({ take: 3 });

        if (existingListings.length > 0 && existingAddresses.length > 0 && deliveryPerson && existingUsers.length > 1) {
          // Create sample reservations and deliveries
          for (let i = 0; i < Math.min(2, existingListings.length); i++) {
            const listing = existingListings[i];
            const address = existingAddresses[i % existingAddresses.length];
            const customer = existingUsers.find(u => u.id !== user.id) || existingUsers[0];

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
              console.log(`⚠️ Could not create sample delivery ${i + 1}:`, error);
            }
          }

          // Fetch deliveries again after creating them (handle missing listings)
          const allDeliveriesAfter = await prisma.delivery.findMany({
            include: {
              reservation: {
                include: {
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

          // Get listings separately for each delivery
          const newDeliveriesWithListings = await Promise.all(
            allDeliveriesAfter.map(async (delivery) => {
              if (!delivery.reservation) return null;

              const listing = await prisma.listing.findUnique({
                where: { id: delivery.reservation.listingId }
              });

              return {
                ...delivery,
                reservation: {
                  ...delivery.reservation,
                  listing: listing || null
                }
              };
            })
          );

          const newValidDeliveries = newDeliveriesWithListings.filter(d => d !== null && d.reservation?.listing);

          console.log('📦 Created and found deliveries:', newValidDeliveries.length);
          return NextResponse.json({
            deliveries: newValidDeliveries,
            user: user,
            type: 'created_and_fetched',
            debug: {
              userId: user.id,
              userRole: user.role,
              deliveryPersonId: deliveryPerson.id,
              deliveryCount: newValidDeliveries.length,
              method: 'demo_mode',
              note: 'Authentication bypassed for demo'
            }
          });
        }
      }

      return NextResponse.json({
        deliveries: validDeliveries,
        user: user,
        type: 'all_deliveries',
        debug: {
          userId: user.id,
          userRole: user.role,
          deliveryPersonId: deliveryPerson?.id,
          deliveryCount: validDeliveries.length,
          method: 'demo_mode',
          note: 'Authentication bypassed for demo'
        }
      });
    }

    // User has no delivery assignments and is not delivery role
    console.log('🚫 User has no delivery assignments and is not delivery role:', user.id, 'Role:', user.role);
    return NextResponse.json({
      error: 'No delivery access',
      message: 'You need delivery role or assignments to view deliveries',
      deliveries: [],
      user: user,
      type: 'no_access',
      debug: {
        userId: user.id,
        userRole: user.role
      }
    });
  } catch (error) {
    console.error("❌ Delivery fetch error:", error);
    return NextResponse.json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      deliveries: [],
      type: 'error'
    }, { status: 500 });
  }
}