import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true } // Ensure 'role' is selected
    });

    if (!user || user.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      include: { listings: true, reservations: true, refunds: true },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Admin GET error:", err);
    return NextResponse.json({ error: "Failed to fetch admin data" }, { status: 500 });
  }
}
