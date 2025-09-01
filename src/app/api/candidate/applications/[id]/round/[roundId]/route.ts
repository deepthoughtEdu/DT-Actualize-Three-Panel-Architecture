import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application, RoundProgress } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; roundId: string } }
) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { answers } = await req.json();
    const db = await connectDB();

    const roundProgress: RoundProgress = {
      roundId: new ObjectId(params.roundId),
      answers,
      status: "submitted",
      submission: [],
    };

    await db.collection<Application>("applications").updateOne(
      { _id: new ObjectId(params.id), candidateId: new ObjectId(payload.id) },
      { $push: { rounds: roundProgress } as any } // ✅ cast to bypass strictness
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Submit round error:", err);
    return NextResponse.json({ error: "Failed to submit round" }, { status: 500 });
  }
}
