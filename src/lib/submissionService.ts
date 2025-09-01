// src/lib/submissionService.ts
import { connectDB } from "./db";
import { Submission } from "@/types";
import { ObjectId, OptionalId } from "mongodb";

// Create a new submission
export async function createSubmission(
  data: Omit<Submission, "_id" | "createdAt">
) {
  const db = await connectDB();
  const result = await db.collection<Submission>("submissions").insertOne({
    ...data,
    createdAt: new Date(),
  } as OptionalId<Submission>);
  return result.insertedId;
}

// Get submission by ID
export async function getSubmissionById(id: string) {
  const db = await connectDB();
  return db.collection<Submission>("submissions").findOne({ _id: new ObjectId(id) });
}

// Get submissions for a process
export async function getSubmissionsByProcess(processId: string) {
  const db = await connectDB();
  return db
    .collection<Submission>("submissions")
    .find({ processId: new ObjectId(processId) })
    .toArray();
}

// Get submissions for a candidate
export async function getSubmissionsByCandidate(candidateId: string) {
  const db = await connectDB();
  return db
    .collection<Submission>("submissions")
    .find({ candidateId: new ObjectId(candidateId) })
    .toArray();
}

// Update a submission
export async function updateSubmission(id: string, updates: Partial<Submission>) {
  const db = await connectDB();
  await db.collection<Submission>("submissions").updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
}

// Delete a submission
export async function deleteSubmission(id: string) {
  const db = await connectDB();
  await db.collection<Submission>("submissions").deleteOne({ _id: new ObjectId(id) });
}
