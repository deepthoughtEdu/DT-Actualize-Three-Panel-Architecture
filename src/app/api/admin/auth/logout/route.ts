// src/app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // Since JWT is stateless, logout can be handled client-side by removing the token
  // Optionally, you can implement token blacklisting if needed
  return NextResponse.json({ message: "Logged out successfully" });
}
