import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const db = await connectDB();

    const candidate = await db.collection("candidates").findOne({ email });
    if (!candidate) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(password, candidate.password);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const token = generateToken({
      id: candidate._id.toString(),
      email: candidate.email,
      role: "candidate",
    });

    return NextResponse.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
