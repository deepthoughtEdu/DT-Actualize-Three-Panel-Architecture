// src/app/api/admin/process/[id]/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateProcess } from "@/lib/processService";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await updateProcess(id, { status: "published" });

    // const publicLink = `/apply/${id}`;
    return NextResponse.json({ message: "Process published" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to publish process" }, { status: 500 });
  }
}
