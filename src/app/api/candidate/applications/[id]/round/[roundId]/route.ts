import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { Process } from "@/types";

export async function POST(
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
    const roundExists = app.rounds.some(
      (r) => r.roundId === roundId
    );

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
    const updatedApp = await db
      .collection<Application>("applications")
      .findOne({
        processId: appId,
        candidateId: candidateId,
      });

    if (!updatedApp) {
      return NextResponse.json(
        { error: "Failed to reload application" },
        { status: 500 }
      );
    }

    const uniqueRounds = new Map();
    updatedApp.rounds.forEach((r) => {
      uniqueRounds.set(r.roundId, r);
    });
    // console.log("UR",uniqueRounds.values());

    // Build a map of submitted rounds
    const submittedMap = new Map(
      updatedApp.rounds.map((r) => [r.roundId, r.status])
    );

    // ✅ Count how many rounds in process are submitted
    const submittedRoundsCount = process.rounds.filter(
      (round) => submittedMap.get(round._id) === "submitted"
    ).length;

    console.log(submittedRoundsCount);
    

    const totalRoundsCount = process.rounds.length;
    console.log(totalRoundsCount);

    // ✅ Determine if this is the first round submission
    const isFirstSubmission = updatedApp.status === "applied";

    if (submittedRoundsCount >= totalRoundsCount) {
      // ✅ All rounds completed → mark as completed
      await db
        .collection<Application>("applications")
        .updateOne(
          { processId: appId, candidateId: candidateId },
          { $set: { status: "completed", currentRoundIndex: null } }
        );
      console.log("Rounds after update:", updatedApp.rounds);

      return NextResponse.json({ success: true, nextRoundIndex: null });
    } else {
      // ✅ Still rounds left → if first submission, update status to "in-progress"
      const newStatus = isFirstSubmission ? "in-progress" : updatedApp.status;

      // ✅ Find the next round that is not submitted
      const nextIndex = updatedApp.rounds.findIndex(
        (r) => r.status !== "submitted"
      );
      // console.log(nextIndex);

      const validNextIndex = nextIndex !== -1 ? nextIndex : 0;
      const nextTitle = process.rounds[validNextIndex].title;

      await db.collection<Application>("applications").updateOne(
        { processId: appId, candidateId: candidateId },
        {
          $set: {
            currentRoundIndex: validNextIndex,
            currentRoundTitle: nextTitle,
            status: newStatus,
          },
        }
      );
      // console.log("Rounds after update:", updatedApp.rounds);

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

