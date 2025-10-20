import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Check if data already exists
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const deliveryCount = await prisma.user.count({ where: { role: 'delivery' } });
    const deliveryPersonCount = await prisma.deliveryPerson.count();
    const deliveryCountData = await prisma.delivery.count();
    const listingCount = await prisma.listing.count();
    const reservationCount = await prisma.reservation.count();
    const addressCount = await prisma.address.count();

    return NextResponse.json({
      message: 'Database connection successful',
      status: 'connected',
      data: {
        adminUsers: adminCount,
        deliveryUsers: deliveryCount,
        deliveryPersons: deliveryPersonCount,
        deliveries: deliveryCountData,
        listings: listingCount,
        reservations: reservationCount,
        addresses: addressCount
      },
      usage: 'POST to /api/admin/seed to populate database',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Database connection failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      usage: 'Check DATABASE_URL environment variable',
      troubleshooting: [
        'Ensure DATABASE_URL is set in environment variables',
        'Verify MongoDB connection string is correct',
        'Check if database server is running',
        'Ensure Prisma schema is up to date'
      ]
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST() {
  try {
    console.log('🌱 Starting production database seeding via API...');

    // Test database connection first
    await prisma.$connect();
    console.log('✅ Database connection established');

    let createdCount = 0;
    let skippedCount = 0;

    // Create admin user if not exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 12);
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@rentpal.com',
          hashedPassword: adminPassword,
          role: 'admin',
          isVerified: true,
        },
      });
      console.log('✅ Created admin user');
      createdCount++;
    } else {
      console.log('✅ Admin user already exists');
      skippedCount++;
    }

    // Create delivery users if not exists
    const deliveryUsers = [
      {
        name: 'Delivery Person 1',
        email: 'delivery1@rentpal.com',
        phone: '9876543210',
        aadharNumber: '123456789012',
        aadhaarNumber: '123456789012',
        bankAccount: '1234567890',
      },
      {
        name: 'Delivery Person 2',
        email: 'delivery2@rentpal.com',
        phone: '9876543211',
        aadharNumber: '123456789013',
        aadhaarNumber: '123456789013',
        bankAccount: '1234567891',
      },
      {
        name: 'Delivery Person 3',
        email: 'delivery3@rentpal.com',
        phone: '9876543212',
        aadharNumber: '123456789014',
        aadhaarNumber: '123456789014',
        bankAccount: '1234567892',
      },
    ];

    for (const userData of deliveryUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const deliveryUser = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            hashedPassword: await bcrypt.hash('delivery123', 12),
            role: 'delivery',
            isVerified: true,
            phone: userData.phone,
            aadharNumber: userData.aadharNumber,
          },
        });

        // Create DeliveryPerson record
        await prisma.deliveryPerson.create({
          data: {
            userId: deliveryUser.id,
            phone: userData.phone,
            aadhaarNumber: userData.aadhaarNumber,
            bankAccount: userData.bankAccount,
          },
        });

        console.log('✅ Created delivery user:', deliveryUser.email);
        createdCount++;
      } else {
        console.log('⏭️  Delivery user already exists:', userData.email);
        skippedCount++;
      }
    }

    // Create sample listings if not exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (adminUser) {
      const listings = [
        {
          title: 'Modern Apartment in City Center',
          description: 'Beautiful 2BHK apartment with city views',
          imageSrc: '/images/placeholder.jpg',
          category: 'apartment',
          locationValue: 'mumbai',
          price: 2500,
          itemCount: 1,
        },
        {
          title: 'Cozy Studio Near Metro',
          description: 'Perfect studio apartment for single occupancy',
          imageSrc: '/images/placeholder.jpg',
          category: 'studio',
          locationValue: 'delhi',
          price: 1800,
          itemCount: 1,
        },
        {
          title: 'Luxury Villa with Pool',
          description: 'Spacious villa with private pool and garden',
          imageSrc: '/images/placeholder.jpg',
          category: 'villa',
          locationValue: 'bangalore',
          price: 5000,
          itemCount: 1,
        },
      ];

      for (const listingData of listings) {
        const existingListing = await prisma.listing.findFirst({
          where: {
            title: listingData.title,
            userId: adminUser.id
          }
        });

        if (!existingListing) {
          await prisma.listing.create({
            data: {
              title: listingData.title,
              description: listingData.description,
              imageSrc: listingData.imageSrc,
              category: listingData.category,
              locationValue: listingData.locationValue,
              price: listingData.price,
              itemCount: listingData.itemCount,
              userId: adminUser.id,
            },
          });
          console.log('✅ Created listing:', listingData.title);
          createdCount++;
        } else {
          console.log('⏭️  Listing already exists:', listingData.title);
          skippedCount++;
        }
      }

      // Create sample addresses if not exists
      const addresses = [
        {
          street: '123 Main Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001',
          country: 'India',
          phone: '9876543210',
        },
        {
          street: '456 Business District',
          city: 'Delhi',
          state: 'Delhi',
          postalCode: '110001',
          country: 'India',
          phone: '9876543211',
        },
      ];

      for (const addressData of addresses) {
        const existingAddress = await prisma.address.findFirst({
          where: {
            street: addressData.street,
            city: addressData.city,
            userId: adminUser.id
          }
        });

        if (!existingAddress) {
          await prisma.address.create({
            data: {
              userId: adminUser.id,
              street: addressData.street,
              city: addressData.city,
              state: addressData.state,
              postalCode: addressData.postalCode,
              country: addressData.country,
              phone: addressData.phone,
            },
          });
          console.log('✅ Created address:', addressData.city);
          createdCount++;
        } else {
          console.log('⏭️  Address already exists:', addressData.city);
          skippedCount++;
        }
      }

      // Create sample deliveries if not exists
      const deliveryUser = await prisma.user.findFirst({
        where: { role: 'delivery' }
      });

      if (deliveryUser) {
        const sampleListing = await prisma.listing.findFirst();
        const sampleAddress = await prisma.address.findFirst();

        if (sampleListing && sampleAddress) {
          // Create a sample reservation
          const reservation = await prisma.reservation.create({
            data: {
              userId: adminUser.id,
              listingId: sampleListing.id,
              startDate: new Date(),
              endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              totalPrice: sampleListing.price * 7,
              status: 'active',
            },
          });

          // Create delivery for this reservation
          const existingDelivery = await prisma.delivery.findFirst({
            where: { reservationId: reservation.id }
          });

          if (!existingDelivery) {
            await prisma.delivery.create({
              data: {
                reservationId: reservation.id,
                addressId: sampleAddress.id,
                deliveryPersonId: deliveryUser.id,
                status: 'pending',
              },
            });
            console.log('✅ Created sample delivery');
            createdCount++;
          } else {
            console.log('⏭️  Delivery already exists for reservation');
            skippedCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Production database seeded successfully!',
      summary: {
        created: createdCount,
        skipped: skippedCount,
        total: createdCount + skippedCount
      },
      details: {
        adminUsers: existingAdmin ? 'Already exists' : 'Created',
        deliveryUsers: '3 users processed',
        listings: '3 listings processed',
        addresses: '2 addresses processed',
        deliveries: '1 delivery processed'
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check DATABASE_URL environment variable and database connectivity',
      troubleshooting: [
        'Ensure DATABASE_URL is set in Vercel environment variables',
        'Verify MongoDB database is accessible',
        'Check Prisma schema matches database structure',
        'Ensure all required environment variables are configured'
      ]
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
