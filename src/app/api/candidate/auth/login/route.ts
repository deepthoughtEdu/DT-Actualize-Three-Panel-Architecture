import { NextRequest, NextResponse } from "next/server";
import { CandidateService } from "@/lib/candidateService";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // ✅ reuse service instead of duplicating logic
    const { token, candidateId } = await CandidateService.login(
      email,
      password
    );

    return NextResponse.json({ token, candidateId });
  } catch (err: any) {
    console.error("Login error:", err.message);

    // ✅ Check if it's a block error and return full details
    if (err.code === "ACCOUNT_BLOCKED") {
      return NextResponse.json(
        {
          error: "account_blocked",
          message: err.details.message,
          reason: err.details.reason,
          blockedUntil: err.details.blockedUntil,
          timeRemaining: err.details.timeRemaining,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
