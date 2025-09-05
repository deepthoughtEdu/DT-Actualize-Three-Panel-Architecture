import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    const db = await connectDB();

    const existing = await db.collection("candidates").findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await db.collection("candidates").insertOne({
      name,
      email,
      password: hashed,
      createdAt: new Date(),
      role: "candidate",
    });

    const token = generateToken({
      id: result?.insertedId.toString(),
      email,
      role: "candidate",
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Failed to register" }, { status: 500 });
  }
}
