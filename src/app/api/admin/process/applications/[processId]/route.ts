import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";
import { getApplicationsByProcessId } from "@/lib/applicationService";

export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify JWT
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Ensure requester is an admin
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // Extract processId from request
    const { processId } = params;

    if (!processId) {
      return NextResponse.json(
        { error: "processId param is required" },
        { status: 400 }
      );
    }

    if (!processId) {
      return NextResponse.json({ error: "processId is required" }, { status: 400 });
    }

    // ✅ Fetch applications for this process
    const data = await getApplicationsByProcessId(processId);

    return NextResponse.json(data);

  } catch (err) {
    console.error("Error fetching applications:", err);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
