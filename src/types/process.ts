// src/types/process.ts
import { ObjectId } from "mongodb";
export type Field = InstructionField | TextField | ChoiceField;

export interface InstructionField {
  fieldId: string;
  type: "instruction";
  title: string;
  description: string;
  resourceLink?: string;
}
export interface TextField {
  fieldId: string;
  type: "text";
  question: string;
  subType: "Text";
  constraints?: {
    wordLimit?: number;
    charLimit?: number;
    languageSelector?: string[];
  };
}

export interface ChoiceField {
  fieldId: string;
  type: "choice";
  question: string;
  subType: "MultipleChoice";
  options: string[];
  correctAnswer?: string[];
}
interface Uploads {
  url: string;
  type: "image" | "audio";
}

export type RoundType = "form" | "instruction";

export interface BaseRound {
  _id: ObjectId;
  order: number;
  title: string;
  type: RoundType;
}

export interface FormRound extends BaseRound {
  type: "form";
  fields: Field[];
}

export interface InstructionRound extends BaseRound {
  type: "instruction";
  instruction: string; // long text / markdown instructions
  uploads?:Uploads[];
  fields?: never;      // ❌ not allowed for instruction rounds
}

export type Round = FormRound | InstructionRound;


// export interface Round {
//   _id: ObjectId;       // or ObjectId if you’re keeping it as Mongo ObjectId
//   order: number;
//   title: string;
//   type: string;
//   fields: Field[];     // refine this later to match field schema
// }

export interface Submission {
  _id?: ObjectId;
  candidateId: ObjectId;
  roundId: string;
  responses: any;
  submittedAt: Date;
}

export interface Process {
  _id?: ObjectId;
  adminId: ObjectId; // owner
  title: string;
  description?: string;
  rounds: Round[]; // can be expanded into a Round type
  submissions?: Submission[];
  createdAt: Date;
  status: "draft" | "published"; // ✅ add this
}
