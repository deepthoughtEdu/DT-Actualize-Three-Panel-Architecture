// src/app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/adminService";
import { generateToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await verifyAdmin(email, password);
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = generateToken({ id: admin._id?.toString(), email, role: 'admin' });

    console.log(token);
    return NextResponse.json({ token });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
