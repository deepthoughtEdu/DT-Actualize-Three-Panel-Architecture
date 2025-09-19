import { NextRequest, NextResponse } from "next/server";
import { getProcessById } from "@/lib/processService";
import { verifyToken } from "@/utils/auth";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const process = await getProcessById(params.id);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // Candidate should not see correct answers
    const safeRounds = process.rounds.map((r: any) => ({
      _id: r._id,
      title: r.title,
      type: r.type,
      fields: r.fields.map((f: any) => {
        const { correctAnswer, ...rest } = f; // remove correctAnswer
        console.log(correctAnswer)
        return rest;
      }),
    }));

    return NextResponse.json({
      _id: process._id,
      title: process.title,
      rounds: safeRounds,
    });
  } catch (err) {
    console.error("Error fetching candidate process:", err);
    return NextResponse.json({ error: "Failed to fetch process" }, { status: 500 });
  }
}
