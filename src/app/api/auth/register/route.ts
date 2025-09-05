// src/app/api/auth/register/route.ts
import { CandidateService } from "@/lib/candidateService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { token } = await CandidateService.register(name, email, password);

    return NextResponse.json({ token, message: "Candidate registered successfully!" });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: err.message?.includes("already") ? 409 : 500 }
    );
  }
}
