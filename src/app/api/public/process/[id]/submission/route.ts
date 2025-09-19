import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";

export async function GET(req: NextRequest, { params }: any) {
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
    const submission = await db.collection("submissions").findOne({
      processId: new ObjectId(params.id),
      candidateId: new ObjectId(decoded.id),
    });

    return NextResponse.json(submission || { message: "No submission yet" });
  } catch (err) {
    console.error("Error fetching submission:", err);
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 });
  }
}
