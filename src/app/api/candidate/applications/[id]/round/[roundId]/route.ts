import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { Process } from "@/types";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const params = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = new ObjectId(params.id); // Application ID
    const candidateId = new ObjectId(payload.id);
    const roundId = params.roundId; // store as string

    const body = await req.json();
    const { answers } = body;

    const db = await connectDB();

    // ✅ Find the application
    const app = await db.collection<Application>("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // ✅ Find the process to get total rounds
    const process = await db.collection<Process>("processes").findOne({
      _id: app.processId,
    });

    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // ✅ Check if this round already exists in application
    const roundExists = app.rounds.some((r) => r.roundId === roundId);

    if (roundExists) {
      // Update existing round
      const updateFields: any = { "rounds.$.status": "submitted" };

      if (answers && Array.isArray(answers)) {
        updateFields["rounds.$.answers"] = answers.map(
          (a: { fieldId: string; answer: any }) => ({
            fieldId: new ObjectId(a.fieldId),
            answer: a.answer,
          })
        );
      }

      await db.collection<Application>("applications").updateOne(
        {
          processId: appId,
          candidateId: candidateId,
          "rounds.roundId": roundId,
        },
        { $set: updateFields }
      );
    } else {
      // Add new round entry
      const roundData: any = {
        roundId: roundId,
        status: "submitted",
        answers: [],
        // submission: [],
      };

      if (answers && Array.isArray(answers)) {
        roundData.answers = answers.map(
          (a: { fieldId: string; answer: any }) => ({
            fieldId: new ObjectId(a.fieldId),
            answer: a.answer,
          })
        );
      }

      await db.collection<Application>("applications").updateOne(
        {
          processId: appId,
          candidateId: candidateId,
        },
        { $push: { rounds: roundData } }
      );
    }

    // ✅ Reload updated application
    const updatedApp = await db.collection<Application>("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });

    if (!updatedApp) {
      return NextResponse.json(
        { error: "Failed to reload application" },
        { status: 500 }
      );
    }

    // ✅ Count submitted rounds
    const submittedRoundsCount = updatedApp.rounds.filter(
      (r) => r.status === "submitted"
    ).length;

    const totalRoundsCount = process.rounds.length;

    // ✅ Determine if this is the first round submission
    const isFirstSubmission = updatedApp.status === "applied";

    if (submittedRoundsCount >= totalRoundsCount) {
      // ✅ All rounds completed → mark as completed
      await db.collection<Application>("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        { $set: { status: "completed", currentRoundIndex: null } }
      );

      return NextResponse.json({ success: true, nextRoundIndex: null });
    } else {
      // ✅ Still rounds left → if first submission, update status to "in-progress"
      const newStatus = isFirstSubmission ? "in-progress" : updatedApp.status;

      // ✅ Find the next round that is not submitted
      const nextIndex = updatedApp.rounds.findIndex(
        (r) => r.status !== "submitted"
      );

      const validNextIndex = nextIndex !== -1 ? nextIndex : 0;

      await db.collection<Application>("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        {
          $set: {
            currentRoundIndex: validNextIndex,
            status: newStatus,
          },
        }
      );

      return NextResponse.json({
        success: true,
        nextRoundIndex: validNextIndex,
      });
    }
  } catch (err) {
    console.error("Submit round error:", err);
    return NextResponse.json(
      { error: "Failed to submit round" },
      { status: 500 }
    );
  }
}
/**
 * Autosave round (keep answers, but not submit)
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; roundId: string }> }
) {
  try {
    const params = await context.params;

    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = new ObjectId(params.id);
    const candidateId = new ObjectId(payload.id);
    const roundId = params.roundId; // Now using as string

    const body = await req.json();
    const { answers } = body;

    const db = await connectDB();

    // 🔹 Update round answers, set status = "in-progress" if still pending
    const updateFields: any = {
      "rounds.$.answers":
        answers?.map((a: { fieldId: string; answer: any }) => ({
          fieldId: new ObjectId(a.fieldId),
          answer: a.answer,
        })) || [],
      "rounds.$.status": "in-progress",
    };

    const result = await db.collection<Application>("applications").updateOne(
      {
        _id: appId,
        candidateId,
        "rounds.roundId": roundId,
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Autosave error:", err);
    return NextResponse.json(
      { error: "Failed to autosave answers" },
      { status: 500 }
    );
  }
}
