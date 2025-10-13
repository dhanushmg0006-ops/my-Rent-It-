const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminEmail = 'admin@rentpal.com';
  const adminPassword = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin User',
      email: adminEmail,
      hashedPassword: adminPassword,
      role: 'admin',
      isVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

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
    const deliveryUser = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
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
    await prisma.deliveryPerson.upsert({
      where: { userId: deliveryUser.id },
      update: {},
      create: {
        userId: deliveryUser.id,
        phone: userData.phone,
        aadhaarNumber: userData.aadhaarNumber,
        bankAccount: userData.bankAccount,
      },
    });

    console.log('✅ Created delivery user:', deliveryUser.email);
  }

  // Create sample listings
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
    const listing = await prisma.listing.upsert({
      where: { title: listingData.title },
      update: {},
      create: {
        title: listingData.title,
        description: listingData.description,
        imageSrc: listingData.imageSrc,
        category: listingData.category,
        locationValue: listingData.locationValue,
        price: listingData.price,
        itemCount: listingData.itemCount,
        userId: admin.id, // Admin owns the listings
      },
    });

    console.log('✅ Created listing:', listing.title);
  }

  // Create sample addresses for the admin user
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
    const address = await prisma.address.upsert({
      where: {
        userId_street_city: {
          userId: admin.id,
          street: addressData.street,
          city: addressData.city,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.postalCode,
        country: addressData.country,
        phone: addressData.phone,
      },
    });

    console.log('✅ Created address:', address.city);
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

