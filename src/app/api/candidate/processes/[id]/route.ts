import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Process } from "@/types/process";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = await connectDB();
    const process = await db.collection<Process>("processes").findOne({ _id: new ObjectId(params.id) });
    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    return NextResponse.json(process);
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json({ error: "Failed to fetch process" }, { status: 500 });
  }
}
