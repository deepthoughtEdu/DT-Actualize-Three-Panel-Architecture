import { NextRequest, NextResponse } from "next/server";
import {
  // deleteProcess,
  // deleteRound,
  getProcessById,
  // updateProcess,
  updateRound,
} from "@/lib/processService";
import { verifyToken } from "@/utils/auth";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const { id: processId, roundId } = params;

    const process = await getProcessById(processId);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    const round = process.rounds.find((r: any) => r._id.toString() === roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json(round);
  } catch (err) {
    console.error("Error fetching round:", err);
    return NextResponse.json(
      { error: "Failed to fetch round" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId } = params;
    const updates = await req.json();

    // Prevent editing type
    if ("type" in updates) {
      delete updates.type;
    }

    const process = await getProcessById(processId);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // const updatedRounds = process.rounds.map((r: any) =>
    //   r._id.toString() === roundId ? { ...r, ...updates } : r
    // );

    const result = await updateRound(processId, roundId, updates);
    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Round not updated" }, { status: 400 });
    }

    return NextResponse.json({ message: "Round updated successfully" });
  } catch (err) {
    console.error("Error updating round:", err);
    return NextResponse.json(
      { error: "Failed to update round" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    // 🔹 Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId } = params;

    const db = await connectDB();

    // Pull the round from the process
    const result = await db.collection("processes").updateOne(
      { _id: new ObjectId(processId) },
      {
        $pull: {
          rounds: {
            $or: [
              { _id: new ObjectId(roundId) }, // if stored as ObjectId
              { _id: roundId }, // if stored as string
            ],
          },
        } as any,
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Round not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Round deleted successfully" });
  } catch (err) {
    console.error("Error deleting round:", err);
    return NextResponse.json(
      { error: "Failed to delete round" },
      { status: 500 }
    );
  }
}
