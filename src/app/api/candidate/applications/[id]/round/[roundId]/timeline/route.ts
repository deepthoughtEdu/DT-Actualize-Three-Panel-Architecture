import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

/**
 * Update timeline for a specific round
 */
export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    // ✅ Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processId = new ObjectId(params.id);
    const candidateId = new ObjectId(payload.id);
    const roundId = params.roundId; // ✅ Get roundId from params

    // ✅ Parse request body
    const body = await req.json();
    const { timeline } = body;

    if (!timeline || typeof timeline !== "string") {
      return NextResponse.json(
        { error: "Timeline is required and must be a string" },
        { status: 400 }
      );
    }

    // ✅ Connect to database
    const db = await connectDB();

    // ✅ Check if round exists in application
    const application = await db.collection("applications").findOne({
      processId: processId,
      candidateId: candidateId,
      "rounds.roundId": roundId,
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application or round not found" },
        { status: 404 }
      );
    }

    // ✅ Update the specific round's timeline
    const result = await db.collection("applications").updateOne(
      {
        processId: processId,
        candidateId: candidateId,
        "rounds.roundId": roundId,
      },
      {
        $set: {
          "rounds.$.timeline": timeline, // ✅ Update timeline for matched round
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update timeline" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Timeline saved successfully", timeline },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error saving timeline:", err);
    return NextResponse.json(
      { error: "Failed to save timeline" },
      { status: 500 }
    );
  }
}

/**
 * Get timeline for a specific round
 */
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    // ✅ Auth check
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const processId = new ObjectId(params.id);
    const candidateId = new ObjectId(payload.id);
    const roundId = params.roundId;

    // ✅ Connect to database
    const db = await connectDB();

    // ✅ Fetch the application and find the specific round
    const application = await db.collection("applications").findOne(
      {
        processId: processId,
        candidateId: candidateId,
      },
      {
        projection: { rounds: 1 },
      }
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // ✅ Find the specific round
    const round = application.rounds?.find((r: any) => r.roundId === roundId);

    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    return NextResponse.json(
      { timeline: round.timeline || null },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching timeline:", err);
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}
