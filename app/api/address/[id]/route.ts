import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

// ✅ Get one address by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    const address = await prisma.address.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!address || address.userId !== currentUser.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

// ✅ Update address
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    const body = await request.json();
    const { street, city, state, postalCode, country, phone } = body;

    const address = await prisma.address.updateMany({
      where: {
        id: params.id,
        userId: currentUser.id, // 👈 ensures user owns the address
      },
      data: {
        street,
        city,
        state,
        postalCode,
        country,
        phone,
      },
    });

    if (address.count === 0) {
      return new NextResponse("Unauthorized or Not Found", { status: 404 });
    }

    return NextResponse.json({ message: "Address updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}

// ✅ Delete address
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return NextResponse.error();

    const address = await prisma.address.deleteMany({
      where: {
        id: params.id,
        userId: currentUser.id, // 👈 prevents deleting others’ addresses
      },
    });

    if (address.count === 0) {
      return new NextResponse("Unauthorized or Not Found", { status: 404 });
    }

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
