import { getProcessById, updateRound } from "@/lib/processService";
import { verifyToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const { id: processId, roundId, fieldId } = params;
    const process = await getProcessById(processId);
    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const round = process.rounds.find((r) => String(r._id) === roundId);
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (round.type !== "form" || !Array.isArray(round.fields)) {
      return NextResponse.json({ error: "This round has no fields" }, { status: 400 });
    }

    const field = round.fields.find((f: any) => String(f._id) === fieldId);
    if (!field) return NextResponse.json({ error: "Field not found" }, { status: 404 });

    return NextResponse.json(field);
  } catch (err) {
    console.error("Error fetching field:", err);
    return NextResponse.json({ error: "Failed to fetch field" }, { status: 500 });
  }
}


export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId, fieldId } = params;
    const updates = await req.json();

    const process = await getProcessById(processId);
    if (!process)
      return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const round = process.rounds.find((r) => String(r._id) === roundId);
    if (!round)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (round.type !== "form" || !Array.isArray(round.fields)) {
      return NextResponse.json({ error: "This round has no editable fields" }, { status: 400 });
    }

    const updatedFields = round.fields.map((f: any) => {
      if (typeof f === "string" || !f._id) return f;
      return String(f._id) === fieldId ? { ...f, ...updates } : f;
    });

    await updateRound(processId, roundId, { fields: updatedFields });

    return NextResponse.json({ message: "Field updated successfully" });
  } catch (err) {
    console.error("Error updating field:", err);
    return NextResponse.json({ error: "Failed to update field" }, { status: 500 });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: any
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer "))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId, fieldId } = params;

    const process = await getProcessById(processId);
    if (!process)
      return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const round = process.rounds.find((r) => String(r._id) === roundId);
    if (!round)
      return NextResponse.json({ error: "Round not found" }, { status: 404 });

    if (round.type !== "form" || !Array.isArray(round.fields)) {
      return NextResponse.json(
        { error: "This round has no fields to delete" },
        { status: 400 }
      );
    }

    const updatedFields = round.fields.filter(
      (f: any) => String(f._id) !== fieldId
    );

    await updateRound(processId, roundId, { fields: updatedFields });

    return NextResponse.json({ message: "Field deleted successfully" });
  } catch (err) {
    console.error("Error deleting field:", err);
    return NextResponse.json(
      { error: "Failed to delete field" },
      { status: 500 }
    );
  }
}