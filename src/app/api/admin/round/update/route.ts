// src/app/api/admin/round/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProcessById, updateProcess } from "@/lib/processService";
import { ObjectId } from "mongodb";

export async function PUT(req: NextRequest) {
  try {
    const { processId, roundId, updates } = await req.json();

    // if (!processId || !roundId || !updates) {
    //   return NextResponse.json({ error: "processId, roundId, and updates are required" }, { status: 400 });
    // }



    if (!processId) {
      return NextResponse.json({ error: "processId is required" }, { status: 400 });
    }

    // Fetch the process
    const process = await getProcessById(processId);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

        let updatedRounds;

    if (roundId) {
      // ✅ Update existing round
      updatedRounds = process.rounds.map((r: any) =>
        r._id.toString() === roundId ? { ...r, ...updates } : r
      );
    } else {
      // ✅ Create new round
      const newRoundId = new ObjectId().toString();
      const newRound = {
        _id: newRoundId,
        order: process.rounds.length + 1, // auto-increment order
        title: updates?.title || "Untitled Round",
        type: updates?.type || "form", // default type
        fields: updates?.fields || []
      };

      updatedRounds = [...process.rounds, newRound];

// Return the new roundId so frontend can use it later
      await updateProcess(processId, { rounds: updatedRounds });
      return NextResponse.json({
        message: "New round created successfully",
        roundId: newRoundId.toString(),
      });
    }

    // Save updated rounds if existing round was modified
    await updateProcess(processId, { rounds: updatedRounds });

    return NextResponse.json({ message: "Round updated successfully" });
  } catch (err) {
    console.error("Error in round or update:", err);
    return NextResponse.json({ error: "Failed to update or create round" }, { status: 500 });
  }
}
