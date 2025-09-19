import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { CandidateService } from "@/lib/candidateService";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: ObjectId }>(token);

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();

    const apps = await db
      .collection("applications")
      .aggregate([
        { $match: { candidateId: new ObjectId(payload.id) } },
        {
          $lookup: {
            from: "processes",
            localField: "processId",
            foreignField: "_id",
            as: "process",
          },
        },
        { $unwind: "$process" },
        {
          $lookup: {
            from: "candidates",
            localField: "candidateId",
            foreignField: "_id",
            as: "candidate",
          },
        },
        { $unwind: "$candidate" },
        {
          $project: {
            _id: 1,
            status: 1,
            rounds: 1,
            currentRoundIndex: 1, // ✅ expose new field
            createdAt: 1,
            process: {
              _id: "$process._id",
              title: "$process.title",
              description: "$process.description",
            },
            candidate: {
              _id: "$candidate._id",
              name: "$candidate.name",
              email: "$candidate.email",
              skills: "$candidate.skills",
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json(apps);
  } catch (err) {
    console.error("Get applications error:", err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { processId } = await req.json();
    const candidateId = new ObjectId(payload.id);

    // 🔹 Delegate to service layer
    // CandidateService should now initialize:
    // - currentRoundIndex = 0
    // - application.status = "in-progress"
    // - rounds[i].status = "pending" (except rounds[0] = "in-progress")
    const result = await CandidateService.applyToProcess(candidateId, processId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Apply error:", err.message);
    return NextResponse.json(
      { error: err.message || "Failed to apply" },
      { status: 500 }
    );
  }
}
