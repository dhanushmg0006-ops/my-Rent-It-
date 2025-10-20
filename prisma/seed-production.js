const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedProduction() {
  console.log('🌱 Starting production database seeding...');

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists, skipping creation');
    } else {
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 12);
      const admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@rentpal.com',
          hashedPassword: adminPassword,
          role: 'admin',
          isVerified: true,
        },
      });
      console.log('✅ Created admin user:', admin.email);
    }

    // Check if delivery users already exist
    const existingDeliveryUsers = await prisma.user.findMany({
      where: { role: 'delivery' }
    });

    if (existingDeliveryUsers.length >= 3) {
      console.log('✅ Delivery users already exist, skipping creation');
    } else {
      // Create delivery users
      const deliveryUsers = [
        {
          name: 'Delivery Person 1',
          email: 'delivery1@rentpal.com',
          phone: '9876543210',
          aadhaarNumber: '123456789012',
          bankAccount: '1234567890',
        },
        {
          name: 'Delivery Person 2',
          email: 'delivery2@rentpal.com',
          phone: '9876543211',
          aadhaarNumber: '123456789013',
          bankAccount: '1234567891',
        },
        {
          name: 'Delivery Person 3',
          email: 'delivery3@rentpal.com',
          phone: '9876543212',
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
              aadhaarNumber: userData.aadhaarNumber,
              bankAccount: userData.bankAccount,
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
        } else {
          console.log('⏭️  Delivery user already exists:', userData.email);
        }
      }
    }

    // Check if sample deliveries exist
    const deliveryCount = await prisma.delivery.count();
    if (deliveryCount > 0) {
      console.log('✅ Deliveries already exist, skipping creation');
    } else {
      // Get a delivery user for assignments
      const deliveryUser = await prisma.user.findFirst({
        where: { role: 'delivery' }
      });

      if (deliveryUser) {
        // Get admin user for reservations
        const adminUser = await prisma.user.findFirst({
          where: { role: 'admin' }
        });

        if (adminUser) {
          // Create a sample reservation with delivery
          const sampleListing = await prisma.listing.findFirst();
          const sampleAddress = await prisma.address.findFirst();

          if (sampleListing && sampleAddress) {
            const reservation = await prisma.reservation.create({
              data: {
                userId: adminUser.id,
                listingId: sampleListing.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                totalPrice: sampleListing.price * 7,
                status: 'active',
              },
            });

            // Create delivery for this reservation
            await prisma.delivery.create({
              data: {
                reservationId: reservation.id,
                addressId: sampleAddress.id,
                deliveryPersonId: deliveryUser.id,
                status: 'pending',
              },
            });

            console.log('✅ Created sample delivery');
          }
        }
      }
    }

    console.log('🎉 Production database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during production seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedProduction();
