// src/app/api/admin/process/[id]/round/[roundId]/instruction/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/utils/auth";

export async function PUT(
  req: NextRequest,
  context: { params: { id: string; roundId: string } }
) {
  const{id, roundId}=await context.params;
  try {
    // 🔹 Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const { instruction } = await req.json();
    if (!instruction) {
      return NextResponse.json({ error: "Instruction is required" }, { status: 400 });
    }

    const db = await connectDB();
    const process = await db
      .collection("processes")
      .findOne({ _id: new ObjectId(id) });

    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const roundIndex = process.rounds.findIndex(
      (r: any) => r._id === roundId
    );
    if (roundIndex === -1)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (process.rounds[roundIndex].type !== "instruction") {
      return NextResponse.json(
        { error: "Only instruction rounds can have instruction text" },
        { status: 400 }
      );
    }

    process.rounds[roundIndex].instruction = instruction;

    await db.collection("processes").updateOne(
      { _id: new ObjectId(id) },
      { $set: { rounds: process.rounds } }
    );

    return NextResponse.json({ message: "Instruction updated", round: process.rounds[roundIndex] });
  } catch (err: any) {
    console.error("Error updating instruction", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; roundId: string } }
) {
  const {id, roundId}= await context.params;
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 403 });

    const db = await connectDB();
    const process = await db
      .collection("processes")
      .findOne({ _id: new ObjectId(id) });

    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const roundIndex = process.rounds.findIndex(
      (r: any) => r._id.toString() === roundId
    );
    if (roundIndex === -1)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (process.rounds[roundIndex].type !== "instruction") {
      return NextResponse.json(
        { error: "Only instruction rounds can have instruction text" },
        { status: 400 }
      );
    }

    delete process.rounds[roundIndex].instruction;

    await db.collection("processes").updateOne(
      { _id: new ObjectId(id) },
      { $set: { rounds: process.rounds } }
    );

    return NextResponse.json({ message: "Instruction deleted" });
  } catch (err) {
    console.error("Error deleting instruction", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { id: string; roundId: string } }
) {
  const { id, roundId } = await context.params;
  try {
    const db = await connectDB();
    const process = await db
      .collection("processes")
      .findOne({ _id: new ObjectId(id) });

    if (!process)
      return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const round = process.rounds.find((r: any) => r._id.toString() === roundId);
    if (!round)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (round.type !== "instruction") {
      return NextResponse.json(
        { error: "This round is not an instruction round" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      instruction: round.instruction || "",
      uploads: (round.uploads || []).map(({ url, type }: any) => ({ url, type }))
    });

  } catch (err) {
    console.error("Error fetching instruction", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
