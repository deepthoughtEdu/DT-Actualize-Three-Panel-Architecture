// src/app/api/admin/auth/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"; // or your existing verifyToken util
import { createAdmin } from "@/lib/adminService"; // you'll implement DB logic

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    if (decoded.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create new admins" },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const newAdmin = await createAdmin(body);

    return NextResponse.json({
      message: "Admin created successfully",
      adminId: newAdmin,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
