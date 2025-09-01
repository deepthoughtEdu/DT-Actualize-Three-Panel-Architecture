import { getProcessById, updateRound } from "@/lib/processService";
import { verifyToken } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string; roundId: string } }) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const { id: processId, roundId } = params;
    const { fieldOrder } = await req.json(); // expects array of fieldIds in new order

    const process = await getProcessById(processId);
    if (!process) return NextResponse.json({ error: "Process not found" }, { status: 404 });

    const round = process.rounds.find(r => r._id.toString() === roundId);
    if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

    const fieldsById = Object.fromEntries(round.fields.map((f: any) => [f._id.toString(), f]));
    const reorderedFields = fieldOrder.map((fid: string) => fieldsById[fid]).filter(Boolean);

    await updateRound(processId, roundId, { fields: reorderedFields });
    return NextResponse.json({ message: "Fields reordered successfully" });
  } catch (err) {
    console.error("Error reordering fields:", err);
    return NextResponse.json({ error: "Failed to reorder fields" }, { status: 500 });
  }
}
