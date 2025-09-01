import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Process } from "@/types/process";

export async function GET(req: NextRequest) {
  try {
    const db = await connectDB();
    const processes = await db.collection<Process>("processes").find({ status: "published" }).toArray();
    return NextResponse.json(processes);
  } catch (err) {
    console.error("Processes error:", err);
    return NextResponse.json({ error: "Failed to fetch processes" }, { status: 500 });
  }
}
