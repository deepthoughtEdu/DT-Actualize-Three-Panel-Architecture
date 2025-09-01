import { ObjectId } from "mongodb";
import { Round } from "./process";

export interface Submission {
  fieldId: string;
  answer: string;
}

export interface RoundProgress {
  roundId: ObjectId;
  answers:any;
  status: "pending" | "submitted";
  submission?: Submission[];
}

export interface Application {
  _id?: ObjectId;
  candidateId: ObjectId;
  processId: ObjectId;
  status: "applied" | "in-progress" | "completed";
  rounds: RoundProgress[];
  createdAt: Date;
}
