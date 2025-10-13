import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// ✅ Get all addresses for current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

// ✅ Create new address
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { street, city, state, postalCode, country, phone } = body;

    const address = await prisma.address.create({
      data: {
        userId: currentUser.id,
        street,
        city,
        state,
        postalCode,
        country,
        phone,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
