import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import type { Candidate } from "@/types/candidate";
import type { Process } from "@/types/process";
import type { Application } from "@/types/application";
import { generateToken } from "@/utils/auth";
import { verifyPassword } from "@/utils/hash";

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
      passwordHash: hashed,
      createdAt: new Date(),
      role: "candidate",
    });

    const candidateId = result.insertedId.toString();

    const token = generateToken({
      id: candidateId,
      email,
      role: "candidate",
    });

    return { token, candidateId };
  }

  // 🔹 Login candidate
  static async login(email: string, password: string) {
    const db = await connectDB();
    const candidate = await db.collection("candidates").findOne({ email });
    if (!candidate) throw new Error("Invalid credentials");

    // ✅ CHECK IF CANDIDATE IS BLOCKED
    if (candidate.isBlocked) {
      const now = new Date();
      const blockedUntil = new Date(candidate.blockedUntil);

      // Check if block period has expired
      if (blockedUntil > now) {
        // Still blocked - calculate remaining time
        const timeRemaining = blockedUntil.getTime() - now.getTime();
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutesRemaining = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );

        // Throw error with block info
        const error: any = new Error("account_blocked");
        error.code = "ACCOUNT_BLOCKED";
        error.details = {
          message: `Your account is temporarily blocked because you missed your self-defined timeline deadline.`,
          reason: candidate.blockedReason || "Missed timeline deadline",
          blockedUntil: blockedUntil.toISOString(),
          timeRemaining: {
            hours: hoursRemaining,
            minutes: minutesRemaining,
          },
        };
        throw error;
      } else {
        // ✅ Block period expired - auto unblock
        await db.collection("candidates").updateOne(
          { _id: candidate._id },
          {
            $set: { isBlocked: false },
            $unset: {
              blockedReason: "",
              blockedAt: "",
              blockedUntil: "",
              blockedBy: "",
            },
          }
        );

        // Unblock their applications
        await db.collection("applications").updateMany(
          { candidateId: candidate._id, status: "blocked" },
          {
            $set: { status: "in-progress" },
            $unset: {
              blockedAt: "",
              blockedUntil: "",
            },
          }
        );
      }
    }

    console.log(candidate.password);

    // ✅ compare with passwordHash (not password)
    const valid = await verifyPassword(password, candidate.password);

    if (!valid) throw new Error("Invalid credentials");

    const candidateId = candidate._id.toString();

    const token = generateToken({
      id: candidateId,
      email: candidate.email,
      role: "candidate",
    });
    console.log(token, ` :`, candidateId);

    return { token, candidateId };
  }

  // 🔹 Get candidate profile
  static async getProfile(candidateId: string) {
    const db = await connectDB();
    const candidate = await db
      .collection("candidates")
      .findOne(
        { _id: new ObjectId(candidateId) },
        { projection: { password: 0 } }
      );

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
  static async applyToProcess(candidateId: ObjectId, processId: ObjectId) {
    const db = await connectDB();

    const existing = await db.collection("applications").findOne({
      candidateId: new ObjectId(candidateId),
      processId: new ObjectId(processId),
    });

    if (existing) throw new Error("Already applied to this process");

    // 🔹 Fetch process definition to get its rounds
    const process = await db
      .collection("processes")
      .findOne({ _id: new ObjectId(processId) });
    if (!process) throw new Error("Process not found");

    // 🔹 Map process.rounds to application.rounds with initial statuses
    const rounds = (process.rounds || []).map((r: any, idx: number) => ({
      roundId: r._id,
      status: idx === 0 ? "in-progress" : "pending",
      answers: [],
      submission: [],
    }));

    const application: Application = {
      candidateId: new ObjectId(candidateId),
      processId: new ObjectId(processId),
      status: "applied",
      currentRoundIndex: 0,
      currentRoundTitle: process.rounds[0].title,
      createdAt: new Date(),
      rounds,
    };

    const result = await db.collection("applications").insertOne(application);

    return { applicationId: result.insertedId.toString() };
  }

  // 🔹 Submit answers for a round
  static async submitRound(
    candidateId: string,
    applicationId: string,
    roundId: string,
    answers: any
  ) {
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
