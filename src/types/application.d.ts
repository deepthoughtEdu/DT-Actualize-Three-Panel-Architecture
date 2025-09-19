import { ObjectId } from "mongodb";

export interface Submission {
  fieldId: string;
  answer: string;
}

export interface RoundAnswer {
  fieldId: ObjectId;
  answer: string;
}

export type RoundStatus = "pending" | "in-progress" | "submitted";

export interface RoundProgress {
  roundId: string;
  answers: RoundAnswer[];
  status: RoundStatus;
  submission?: Submission[];
}

export type ApplicationStatus = "applied" | "in-progress" | "completed";

export interface Application {
  _id?: ObjectId;
  candidateId: ObjectId;
  processId: ObjectId;
  status: ApplicationStatus;
  currentRoundIndex: number | null;   // NEW → tracks which round candidate resumes
   currentRoundTitle: string | null;
  rounds: RoundProgress[];
  createdAt: Date;
}
