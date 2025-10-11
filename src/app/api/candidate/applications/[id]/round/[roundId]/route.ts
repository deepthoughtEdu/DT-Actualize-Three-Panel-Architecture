import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

export async function POST(req: NextRequest, context: any) {
  try {
    const { id, roundId } = context.params;

    // ✅ Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const appId = new ObjectId(id);
    const candidateId = new ObjectId(payload.id);
    const body = await req.json();
    const { answers } = body;

    const db = await connectDB();

    // ✅ Fetch application
    const app = await db.collection("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });
    if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // ✅ Fetch process to get round order
    const process = await db.collection("processes").findOne({ _id: app.processId });
    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    // Check if current round exists
    const roundExists = app.rounds.some((r: any) => r.roundId === roundId);

    if (roundExists) {
      // ✅ Update current round to 'submitted' with answers
      const updateFields: any = { "rounds.$.status": "submitted" };
      if (answers && Array.isArray(answers)) {
        updateFields["rounds.$.answers"] = answers.map((a: any) => ({
          fieldId: new ObjectId(a.fieldId),
          answer: a.answer,
        }));
      }

      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId, "rounds.roundId": roundId },
        { $set: updateFields }
      );
    } else {
      // ✅ Add new round entry if it doesn't exist
      const roundData: any = {
        roundId,
        status: "submitted",
        answers: answers?.map((a: any) => ({
          fieldId: new ObjectId(a.fieldId),
          answer: a.answer,
        })) || [],
      };

      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        { $push: { rounds: roundData } }
      );
    }

    // Reload updated application
    const updatedApp = await db.collection("applications").findOne({
      processId: appId,
      candidateId: candidateId,
    });
    if (!updatedApp) return NextResponse.json({ error: "Failed to reload application" }, { status: 500 });

    // ✅ Map roundId → status
    const roundStatusMap = new Map(updatedApp.rounds.map((r: any) => [r.roundId, r.status]));

    // ✅ Count submitted rounds
    const submittedRoundsCount = process.rounds.filter(
      (r: any) => roundStatusMap.get(r._id) === "submitted"
    ).length;

    // ✅ If all rounds submitted → mark application completed
    if (submittedRoundsCount === process.rounds.length) {
      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        { $set: { status: "completed", currentRoundIndex: null, currentRoundTitle: null } }
      );
      return NextResponse.json({ success: true, nextRoundIndex: null });
    }

    // ✅ Find next round in process order
    const nextRoundInProcessOrder = process.rounds.find((r: any) => {
      const status = roundStatusMap.get(r._id);
      return status !== "submitted";
    });

    if (nextRoundInProcessOrder) {
      const nextAppRound = updatedApp.rounds.find((r: any) => r.roundId === nextRoundInProcessOrder._id);

      // ✅ Only update to 'in-progress' if not submitted already
      if (nextAppRound && nextAppRound.status !== "submitted" && nextAppRound.status !== "in-progress") {
        await db.collection("applications").updateOne(
          { processId: appId, candidateId: candidateId, "rounds.roundId": nextAppRound.roundId },
          { $set: { "rounds.$.status": "in-progress" } }
        );
      }

      const nextIndex = process.rounds.findIndex((r: any) => r._id === nextRoundInProcessOrder._id);

      await db.collection("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        {
          $set: {
            currentRoundIndex: nextIndex,
            currentRoundTitle: nextRoundInProcessOrder.title,
            status: updatedApp.status === "applied" ? "in-progress" : updatedApp.status,
          },
        }
      );

      return NextResponse.json({ success: true, nextRoundIndex: nextIndex });
    }

    // Fallback if next round not found
    return NextResponse.json({ success: true, nextRoundIndex: null });
  } catch (err) {
    console.error("Submit round error:", err);
    return NextResponse.json({ error: "Failed to submit round" }, { status: 500 });
  }
}
/**
 * Autosave round (keep answers, but not submit)
 */
export async function PATCH(
  req: NextRequest,
  context: any
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
    const roundId = params.roundId;

    const body = await req.json();
    const { answers } = body;

    const db = await connectDB();

    // 🔹 Get current application
    const application = await db.collection<Application>("applications").findOne({
      processId: appId,
      candidateId,
      "rounds.roundId": roundId,
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // 🔹 Find the round
    const round = application.rounds.find((r) => r.roundId === roundId);
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    // 🔹 Existing answers
    const existingAnswers = round.answers || [];

    // 🔹 Merge logic (replace if exists, otherwise keep old + add new)
    const mergedAnswers = [
      ...existingAnswers.filter(
        (ea) => !answers.some((na: { fieldId: string }) => na.fieldId === ea.fieldId.toString())
      ),
      ...answers.map((a: { fieldId: string; answer: any }) => ({
        fieldId: new ObjectId(a.fieldId),
        answer: a.answer,
      })),
    ];

    // 🔹 Save merged answers
    const result = await db.collection<Application>("applications").updateOne(
      {
        processId: appId,
        candidateId,
        "rounds.roundId": roundId,
      },
      {
        $set: {
          "rounds.$.answers": mergedAnswers,
          "rounds.$.status": "in-progress",
        },
      }
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

