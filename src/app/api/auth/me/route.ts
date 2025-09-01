// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getCandidateById } from "@/lib/candidateService";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken<{ id: string }>(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const candidate = await getCandidateById(payload.id);
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  // Exclude password
  const { password, ...rest } = candidate;
  return NextResponse.json(rest);
}
