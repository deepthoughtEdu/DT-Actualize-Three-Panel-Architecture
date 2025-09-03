// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { CandidateService } from "@/lib/candidateService";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { token } = await CandidateService.login(email, password);

    return NextResponse.json({
      token,
      message: "Candidate logged in successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 401 }
    );
  }
}
