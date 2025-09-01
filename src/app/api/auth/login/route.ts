// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCandidateByEmail } from "@/lib/candidateService";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const candidate = await getCandidateByEmail(email);
  if (!candidate) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const isValid = await bcrypt.compare(password, candidate.password);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = generateToken({ id: candidate._id?.toString(), email: candidate.email });
  return NextResponse.json({ token, message:"Candidate logged in successfully" });
}
