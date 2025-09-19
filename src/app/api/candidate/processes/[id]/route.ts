import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Process } from "@/types";
import { connectDB } from "@/lib/db";

export async function GET(
  req: Request,
  context: any
) {
  try {
    const { id } = await context.params; // ✅ await params
    const db = await connectDB();

    const process = await db
      .collection<Process>("processes")
      .findOne({ _id: new ObjectId(id) });

    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    return NextResponse.json(process);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
