import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthToken, verifyToken } from "@/utils/auth";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const token = getAuthToken(req.headers.get("authorization"));
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken<{ id: string; email: string; role: string }>(token);
    if (!decoded || decoded.role !== "candidate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();
    const candidate = await db
      .collection("candidates")
      .findOne({ _id: new ObjectId(decoded.id) }, { projection: { password: 0 } });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (err) {
    console.error("Me error:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
