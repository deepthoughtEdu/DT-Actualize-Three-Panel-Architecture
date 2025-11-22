import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import {
  parseTimelineToDate,
  isTimelineExpired,
  getTimeRemaining,
} from "@/utils/timeline";

/**
 * Get timeline for a specific round with expiration info
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

    // ✅ If no timeline set, return null
    if (!round.timeline) {
      return NextResponse.json(
        {
          timeline: null,
          hasTimeline: false,
          expired: false,
          timeRemaining: null,
        },
        { status: 200 }
      );
    }

    // ✅ Check expiration status
    const expired = isTimelineExpired(round.timeline);
    const timeRemaining = getTimeRemaining(round.timeline);
    const timelineDate = parseTimelineToDate(round.timeline);

    return NextResponse.json(
      {
        timeline: round.timeline, // Original string
        timelineDate: timelineDate?.toISOString(), // ISO format for frontend
        hasTimeline: true,
        expired: expired, // Boolean
        timeRemaining: timeRemaining, // {days, hours, minutes}
        roundStatus: round.status, // Current round status
      },
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
    const roundId = params.roundId;

    const body = await req.json();
    const { timeline } = body;

    if (!timeline || typeof timeline !== "string") {
      return NextResponse.json(
        { error: "Timeline is required and must be a string" },
        { status: 400 }
      );
    }

    // ✅ Parse string to Date object
    const timelineDate = parseTimelineToDate(timeline);

    if (!timelineDate) {
      return NextResponse.json(
        { error: "Invalid timeline format" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Check if round exists
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

    // ✅ Update with both string and Date object
    const result = await db.collection("applications").updateOne(
      {
        processId: processId,
        candidateId: candidateId,
        "rounds.roundId": roundId,
      },
      {
        $set: {
          "rounds.$.timeline": timeline,
          "rounds.$.timelineDate": timelineDate,
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
      {
        success: true,
        message: "Timeline saved successfully",
        timeline,
        timelineDate: timelineDate.toISOString(),
      },
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
