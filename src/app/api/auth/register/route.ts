import { NextRequest, NextResponse } from "next/server";
import { createCandidate, getCandidateByEmail } from "@/lib/candidateService";
import { hashPassword } from "@/utils/hash";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, resumeUrl } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await getCandidateByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Candidate already exists" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const candidateId = await createCandidate({
      name,
      email,
      password: hashedPassword,
      resumeUrl,
    });

    return NextResponse.json({ candidateId, message:"Candidate registered successfully!!"  });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
