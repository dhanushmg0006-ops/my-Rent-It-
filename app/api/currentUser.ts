import { NextResponse } from "next/server";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure isVerified is boolean
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified ?? false, // default to false if null
      image: user.image,
    };

    return NextResponse.json(safeUser);
  } catch (err) {
    console.error("CurrentUser API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
