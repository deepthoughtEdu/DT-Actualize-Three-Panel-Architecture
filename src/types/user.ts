// src/types/user.ts
import { ObjectId } from "mongodb";

export interface Admin {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface Candidate {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string; // <-- add this
  phone?: string;
  resumeUrl?: string;
  createdAt: Date;
}
