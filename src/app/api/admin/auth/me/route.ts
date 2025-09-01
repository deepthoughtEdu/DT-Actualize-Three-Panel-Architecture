// src/app/api/admin/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth"; // your JWT utility
import { getAdminById } from "@/lib/adminService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken<{ id: string }>(token);

  if (!payload?.id) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const admin = await getAdminById(payload.id);
  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  // Exclude sensitive info like password
  const { password, ...adminData } = admin;
  return NextResponse.json(adminData);
}
