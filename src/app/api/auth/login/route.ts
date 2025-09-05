// src/app/api/auth/login/route.ts
import { CandidateService } from "@/lib/candidateService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const { token } = await CandidateService.login(email, password);

    return NextResponse.json({ token, message: "Login successful!" });
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 401 }
    );
  }
}
