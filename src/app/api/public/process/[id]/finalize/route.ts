import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await connectDB();

    await db.collection("submissions").updateOne(
      { processId: new ObjectId(params.id), candidateId: new ObjectId(decoded.id) },
      { $set: { status: "submitted", updatedAt: new Date() } }
    );

    return NextResponse.json({ message: "Submission finalized" });
  } catch (err) {
    console.error("Error finalizing submission:", err);
    return NextResponse.json({ error: "Failed to finalize submission" }, { status: 500 });
  }
}
