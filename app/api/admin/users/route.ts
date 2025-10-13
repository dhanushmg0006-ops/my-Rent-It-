import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/libs/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (!admin || admin.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await request.json();
  if (!userId || !role) return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });

  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json(updated);
}