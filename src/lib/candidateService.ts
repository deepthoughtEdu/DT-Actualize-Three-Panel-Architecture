import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type { Candidate } from "@/types/candidate";
import type { Process } from "@/types/process";
import type { Application } from "@/types/application";
import { generateToken } from "@/utils/auth";

export class CandidateService {
  // 🔹 Register candidate
  static async register(name: string, email: string, password: string) {
    const db = await connectDB();
    const existing = await db.collection("candidates").findOne({ email });
    if (existing) throw new Error("Email already registered");

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.collection("candidates").insertOne({
      name,
      email,
      password: hashed,
      createdAt: new Date(),
      role: "candidate",
    });

    const token = generateToken({
      id: result.insertedId.toString(),
      email,
      role: "candidate",
    });

    return { token };
  }

  // 🔹 Login candidate
  static async login(email: string, password: string) {
    const db = await connectDB();
    const candidate = await db.collection("candidates").findOne({ email });
    if (!candidate) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, candidate.password);
    if (!valid) throw new Error("Invalid credentials");

    const token = generateToken({
      id: candidate._id.toString(),
      email: candidate.email,
      role: "candidate",
    });

    return { token };
  }

  // 🔹 Get candidate profile
  static async getProfile(candidateId: string) {
    const db = await connectDB();
    const candidate = await db
      .collection("candidates")
      .findOne({ _id: new ObjectId(candidateId) }, { projection: { password: 0 } });

    if (!candidate) throw new Error("Candidate not found");
    return candidate as unknown as Candidate;
  }

  // 🔹 Fetch all published processes
  static async getProcesses() {
    const db = await connectDB();
    const processes = await db
      .collection("processes")
      .find({ status: "published" })
      .project({ title: 1, description: 1, createdAt: 1 })
      .toArray();

    return processes as Process[];
  }

  // 🔹 Fetch single process with rounds
  static async getProcessById(processId: string) {
    const db = await connectDB();
    const process = await db
      .collection("processes")
      .findOne({ _id: new ObjectId(processId), status: "published" });

    if (!process) throw new Error("Process not found");
    return process as Process;
  }

  // 🔹 Apply to a process
  static async applyToProcess(candidateId: string, processId: string) {
    const db = await connectDB();

    const existing = await db.collection("applications").findOne({
      candidateId: new ObjectId(candidateId),
      processId: new ObjectId(processId),
    });

    if (existing) throw new Error("Already applied to this process");

    const application: Application = {
      candidateId: new ObjectId(candidateId),
      processId: new ObjectId(processId),
      status: "in-progress",
      createdAt: new Date(),
      rounds: [], // will store round submissions
    };

    const result = await db.collection("applications").insertOne(application);
    return { applicationId: result.insertedId.toString() };
  }

  // 🔹 Submit answers for a round
  static async submitRound(candidateId: string, applicationId: string, roundId: string, answers: any) {
    const db = await connectDB();

    const application = await db.collection("applications").findOne({
      _id: new ObjectId(applicationId),
      candidateId: new ObjectId(candidateId),
    });
    if (!application) throw new Error("Application not found");

    await db.collection("applications").updateOne(
      { _id: new ObjectId(applicationId) },
      {
        $push: {
          rounds: {
            roundId: new ObjectId(roundId),
            answers,
            submittedAt: new Date(),
          } as any,
        },
      }
    );

    return { success: true };
  }

  // 🔹 Get all applications for candidate
  static async getApplications(candidateId: string) {
    const db = await connectDB();
    const applications = await db
      .collection("applications")
      .find({ candidateId: new ObjectId(candidateId) })
      .toArray();

    return applications as unknown as Application[];
  }

  // 🔹 Get single application with progress
  static async getApplicationById(candidateId: string, applicationId: string) {
    const db = await connectDB();
    const application = await db.collection("applications").findOne({
      _id: new ObjectId(applicationId),
      candidateId: new ObjectId(candidateId),
    });

    if (!application) throw new Error("Application not found");
    return application as unknown as Application;
  }
}
