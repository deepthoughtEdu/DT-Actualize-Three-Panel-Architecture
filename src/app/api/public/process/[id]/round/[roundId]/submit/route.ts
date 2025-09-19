import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { processId, roundId } = params;
    const { answers } = await req.json();

    const db = await connectDB();
    const submissions = db.collection("submissions");

    // find existing submission
    const submission = await submissions.findOne({
      processId: new ObjectId(processId),
      candidateId: new ObjectId(decoded.id),
    });

    const newAnswers = answers.map((a: any) => ({
      roundId: new ObjectId(roundId),
      fieldId: new ObjectId(a.fieldId),
      answer: a.answer,
    }));

    if (submission) {
      // merge old answers with new ones
      await submissions.updateOne(
        { _id: submission._id },
        {
          $set: {
            answers: [...(submission.answers || []), ...newAnswers],
            updatedAt: new Date(),
          },
        }
      );
    } else {
      // create new submission
      await submissions.insertOne({
        processId: new ObjectId(processId),
        candidateId: new ObjectId(decoded.id),
        status: "applied",
        createdAt: new Date(),
        updatedAt: new Date(),
        answers: newAnswers,
      });
    }

    return NextResponse.json({ message: "Answers submitted" });
  } catch (err) {
    console.error("Error saving answers:", err);
    return NextResponse.json({ error: "Failed to save answers" }, { status: 500 });
  }
}
