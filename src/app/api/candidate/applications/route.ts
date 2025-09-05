import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { log } from "console";
import { CandidateService } from "@/lib/candidateService";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: ObjectId }>(token);
    
    console.log(payload);
    
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Candidate ID from token:", payload.id);

    const db = await connectDB();

    const apps = await db
  .collection("applications")
  .aggregate([
    // Filter: only this candidate’s apps (if you want all candidates, remove this match)
    { $match: { candidateId: new ObjectId(payload.id) } },

    // 🔗 Join with processes collection
    {
      $lookup: {
        from: "processes",
        localField: "processId",
        foreignField: "_id",
        as: "process",
      },
    },
    { $unwind: "$process" },

    // 🔗 Join with candidates collection
    {
      $lookup: {
        from: "candidates",
        localField: "candidateId",
        foreignField: "_id",
        as: "candidate",
      },
    },
    { $unwind: "$candidate" },

    // Shape the final response
    {
      $project: {
        _id: 1,
        status: 1,
        rounds: 1,
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
          // add more fields you want to expose
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
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { processId } = await req.json();
    // console.log(payload.id);
    const candidateId = new ObjectId(payload.id);
    console.log(candidateId);
    

    // 🔹 Use service method instead of writing logic here
    const result = await CandidateService.applyToProcess(candidateId, processId);

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Apply error:", err.message);
    return NextResponse.json({ error: err.message || "Failed to apply" }, { status: 500 });
  }
}
