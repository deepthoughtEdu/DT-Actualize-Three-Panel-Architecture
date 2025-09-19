import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = await connectDB();
    const app = await db
      .collection<Application>("applications")
      .findOne({ _id: new ObjectId(params.id), candidateId: new ObjectId(payload.id) });

    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(app);
  } catch (err) {
    console.error("Get application error:", err);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}
