// src/lib/adminService.ts
import { connectDB } from "./db";
import { Admin } from "@/types";
import { ObjectId, OptionalId } from "mongodb";
import bcrypt from "bcryptjs";

// Create a new admin (with password hashing)
export async function createAdmin(
  data: Omit<Admin, "_id" | "createdAt">
) {
  const db = await connectDB();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await db.collection<Admin>("admins").insertOne({
    ...data,
    password: hashedPassword,
    createdAt: new Date(),
  } as OptionalId<Admin>);

  return result.insertedId;
}

// Get admin by ID
export async function getAdminById(id: string) {
  const db = await connectDB();
  return db.collection<Admin>("admins").findOne({ _id: new ObjectId(id) });
}

// Get admin by email
export async function getAdminByEmail(email: string) {
  const db = await connectDB();
  return db.collection<Admin>("admins").findOne({ email });
}

// Verify admin credentials
export async function verifyAdmin(email: string, password: string) {
  const db = await connectDB();
  const admin = await db.collection<Admin>("admins").findOne({ email });
  if (!admin) return null;

  const isMatch = await bcrypt.compare(password, admin.password);
  return isMatch ? admin : null;
}

// Update admin details (excluding password)
export async function updateAdmin(id: string, updates: Partial<Admin>) {
  const db = await connectDB();
  await db.collection<Admin>("admins").updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
}

// Delete admin
export async function deleteAdmin(id: string) {
  const db = await connectDB();
  await db.collection<Admin>("admins").deleteOne({ _id: new ObjectId(id) });
}
