import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { Application } from "@/types/application";

// 🔹 Get all applications for a given process
export async function getApplicationsByProcessId(processId: string) {
  const db = await connectDB();

 

  const applications = await db
    .collection("applications")
    .aggregate([
      {
        $match: { processId: new ObjectId(processId) },
      },
      {
        $lookup: {
          from: "candidates",           // collection to join
          localField: "candidateId",    // field in applications
          foreignField: "_id",          // field in candidates
          as: "candidate",              // output field
        },
      },
      {
        $unwind: "$candidate", // flatten the array so each app has a single candidate object
      },
      {
        $project: {
          "candidate.passwordHash": 0, // 🚨 remove sensitive fields
          "candidate.password": 0,
        },
      },
    ])
    .toArray();
    
     const process = await db.collection("processes").findOne({
    _id: new ObjectId(processId),
  });

  return {
    applications,
    process
  } as any;
}

// 🔹 Get single application by applicationId
export async function getApplicationByApplicationId(applicationId: string) {
  const db = await connectDB();

  const application = await db.collection("applications").findOne({
    _id: new ObjectId(applicationId),
  });

  if (!application) throw new Error("Application not found");
  return application as unknown as Application;
}
