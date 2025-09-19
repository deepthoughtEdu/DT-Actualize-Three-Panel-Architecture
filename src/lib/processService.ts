// src/lib/processService.ts
import { connectDB } from "./db";
import { Process, Round } from "@/types";
import { ObjectId, OptionalId } from "mongodb";

// Create a new process
export async function createProcess(data: Omit<Process, "_id" | "createdAt">) {
  const db = await connectDB();
  const result = await db.collection<Process>("processes").insertOne({
    ...data,
    createdAt: new Date(),
  } as OptionalId<Process>);
  return result.insertedId;
}

// Get a process by ID
export async function getProcessById(id: string) {
  const db = await connectDB();
  return db.collection<Process>("processes").findOne({ _id: new ObjectId(id) });
}

// Get all processes for a given admin
export async function getProcessesByAdmin(adminId: string) {
  const db = await connectDB();
  return db
    .collection<Process>("processes")
    .find()
    .toArray();
}

export async function getAllProcesses() {
  const db = await connectDB();
  return db.collection<Process>("processes").find({}).toArray();
}

// Update a process
export async function updateProcess(id: string, updates: Partial<Process>) {
  const db = await connectDB();
  return db
    .collection<Process>("processes")
    .updateOne({ _id: new ObjectId(id) }, { $set: updates });
}

// Delete a process
// export async function deleteProcess(id: string) {
//   const db = await connectDB();
//   await db
//     .collection<Process>("processes")
//     .deleteOne({ _id: new ObjectId(id) });
// }
export async function deleteProcess(id: string) {
  const db = await connectDB();
  await db.collection("processes").deleteOne({ _id: new ObjectId(id) });
}

// 🔹 Add a new round
export async function addRound(processId: string, round: Round) {
  const db = await connectDB();
  return db
    .collection<Process>("processes")
    .updateOne(
      { _id: new ObjectId(processId) },
      { $push: { rounds: { ...round, _id: new ObjectId().toString() } } }
    );
}

// 🔹 Update an existing round (replace round by ID)

export async function updateRound(
  processId: string,
  roundId: string,
  updates: any
) {
  const db = await connectDB();
  const collection = db.collection("processes");

  // Try matching both ObjectId and string _id
  const filter = {
    _id: new ObjectId(processId),
    $or: [
      { "rounds._id": new ObjectId(roundId) }, // if stored as ObjectId
      { "rounds._id": roundId }, // if stored as string
    ],
  };

  const setUpdates = Object.fromEntries(
    Object.entries(updates).map(([k, v]) => [`rounds.$.${k}`, v])
  );

  // console.log("processId:", processId);
  // console.log("roundId:", roundId);
  // console.log("updates:", updates);

  // const process = await collection.findOne({ _id: new ObjectId(processId) });
  // console.log("Process rounds:", process?.rounds);

  const result = await collection.updateOne(filter, { $set: setUpdates });
  return result;
}

// 🔹 Delete a round
export async function deleteRound(processId: string, roundId: string) {
  const db = await connectDB();
  return db
    .collection<Process>("processes")
    .updateOne(
      { _id: new ObjectId(processId) },
      { $pull: { rounds: { _id: new ObjectId(roundId).toString() } } }
    );
}

// export async function deleteProcess(id: string) {
//   const { db } = await connectDB();
//   await db.collection("processes").deleteOne({ _id: new ObjectId(id) });
// }

export async function addRoundInstructionUpload(
  processId: string,
  roundId: string,
  file: { url: string; type: string }
) {
  const db = await connectDB();
  const processes = db.collection("processes");

  const result = await processes.updateOne(
    {
      _id: new ObjectId(processId),
      "rounds._id": new ObjectId(roundId).toString(),
    },
    {
      $push: { "rounds.$.uploads": { ...file, uploadedAt: new Date() } } as any,
    }
  );

  return result.modifiedCount > 0;
}

export async function deleteRoundInstructionUpload(
  processId: string,
  roundId: string,
  fileUrl: string
) {
  const db = await connectDB();
  const collection = db.collection("processes"); // Replace with your actual collection name

  const result = await collection.updateOne(
    { _id: new ObjectId(processId) },
    {
      $pull: {
        "rounds.$[round].uploads": { url: fileUrl }
      } as any
    },
    {
      arrayFilters: [{ "round._id": new ObjectId(roundId).toString() }]
    }
  );

  if (result.modifiedCount === 0) {
    throw new Error("Upload not found or already deleted");
  }

  return true;
}