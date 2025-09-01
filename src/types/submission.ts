// src/types/submission.ts
import { ObjectId } from "mongodb";

export interface Submission {
  _id?: ObjectId;
  processId: ObjectId;
  candidateId: ObjectId;
  answers: Record<string, any>;
  score?: number;
  createdAt: Date;
}
