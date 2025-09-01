// src/app/api/public/process/[id]/round/[order]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProcessById, updateProcess } from "@/lib/processService";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; order: string } }
) {
  const { id, order } = params;

  try {
    const process = await getProcessById(id);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    const roundIndex = parseInt(order, 10) - 1; // assuming order starts at 1
    const roundId = process.rounds?.[roundIndex];

    if (!roundId) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json({ roundId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch round" }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const { processId, roundId, candidateId, responses } = await req.json();

    if (!processId || !roundId || !candidateId || !responses) {
      return NextResponse.json(
        { error: "processId, roundId, candidateId, and responses are required" },
        { status: 400 }
      );
    }

    const process = await getProcessById(processId);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    if (process.status !== "published") {
      return NextResponse.json({ error: "Process not published" }, { status: 403 });
    }

    // Store submissions inside the process (or ideally in a separate collection for scaling)
    const submission = {
      _id: new ObjectId(),
      candidateId,
      roundId,
      responses,
      submittedAt: new Date(),
    };

    const updatedSubmissions = process.submissions
      ? [...process.submissions, submission]
      : [submission];

    await updateProcess(processId, { submissions: updatedSubmissions });

    return NextResponse.json({ message: "Submission received", submissionId: submission._id.toString() });
  } catch (err) {
    console.error("Error in candidate submission:", err);
    return NextResponse.json({ error: "Failed to submit responses" }, { status: 500 });
  }
}
