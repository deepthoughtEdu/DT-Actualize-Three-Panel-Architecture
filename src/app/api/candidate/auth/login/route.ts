import { NextRequest, NextResponse } from "next/server";
import { CandidateService } from "@/lib/candidateService";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    // console.log(typeof(password));
    

    // ✅ reuse service instead of duplicating logic
    const { token, candidateId } = await CandidateService.login(email, password);

    return NextResponse.json({ token, candidateId });
  } catch (err: any) {
    console.error("Login error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
