// src/app/api/admin/process/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteProcess, getProcessById, updateProcess } from "@/lib/processService";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const process = await getProcessById(id);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }
    return NextResponse.json(process);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch process" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const updates = await req.json();

    await updateProcess(id, updates);
    return NextResponse.json({ message: "Process updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update process" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const updates = await req.json();

    // ✅ Ensure only allowed fields are updated
    const allowedUpdates: any = {};
    if (updates.title) allowedUpdates.title = updates.title;
    if (updates.description) allowedUpdates.description = updates.description;
    if (updates.rounds) allowedUpdates.rounds = updates.rounds; // <-- update rounds
    if (updates.status) allowedUpdates.status = updates.status;

    allowedUpdates.updatedAt = new Date();

    await updateProcess(params.id, allowedUpdates);

    return NextResponse.json({ message: "Process updated successfully" });
  } catch (err) {
    console.error("Error updating process:", err);
    return NextResponse.json(
      { error: "Failed to update process" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    const { id } = params;

    const process = await getProcessById(id);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    await deleteProcess(id);

    return NextResponse.json({ message: "Process deleted successfully" });
  } catch (err) {
    console.error("Error deleting process:", err);
    return NextResponse.json(
      { error: "Failed to delete process" },
      { status: 500 }
    );
  }
}