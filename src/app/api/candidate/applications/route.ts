import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Application } from "@/types/application";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string }>(token);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await connectDB();

    const apps = await db
      .collection("applications")
      .aggregate([
        {
          $match: { candidateId: new ObjectId(payload.id) },
        },
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
          $project: {
            _id: 1,
            status: 1,
            rounds: 1,
            createdAt: 1,
            processId: {
              _id: "$process._id",
              title: "$process.title",
              description: "$process.description",
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
    const db = await connectDB();

    const application: Application = {
      candidateId: new ObjectId(payload.id),
      processId: new ObjectId(processId),
      status: "applied",
      rounds: [],
      createdAt: new Date(),
    };

    const result = await db.collection<Application>("applications").insertOne(application);

    return NextResponse.json({ _id: result.insertedId, ...application });
  } catch (err) {
    console.error("Apply error:", err);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
