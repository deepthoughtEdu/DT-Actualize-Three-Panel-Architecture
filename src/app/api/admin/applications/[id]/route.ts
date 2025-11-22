import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";

/**
 * Get single application details
 */
export async function GET(req: NextRequest, { params }: any) {
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
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    const application = await db
      .collection("applications")
      .aggregate([
        { $match: { _id: applicationId } },
        {
          $lookup: {
            from: "candidates",
            localField: "candidateId",
            foreignField: "_id",
            as: "candidate",
          },
        },
        {
          $lookup: {
            from: "processes",
            localField: "processId",
            foreignField: "_id",
            as: "process",
          },
        },
        { $unwind: "$candidate" },
        { $unwind: "$process" },
      ])
      .toArray();

    if (!application || application.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application[0]);
  } catch (err) {
    console.error("Error fetching application:", err);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

/**
 * Update application - Block candidate or change status
 */
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
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { action, status, reason, blockDurationHours = 24 } = body;

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // ✅ BLOCK CANDIDATE ACTION
    if (action === "blockCandidate") {
      const application = await db
        .collection("applications")
        .findOne({ _id: applicationId });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      const now = new Date();
      const blockedUntil = new Date(
        now.getTime() + blockDurationHours * 60 * 60 * 1000
      );

      // Block the candidate
      await db.collection("candidates").updateOne(
        { _id: application.candidateId },
        {
          $set: {
            isBlocked: true,
            blockedReason: reason || "Missed self-defined timeline deadline",
            blockedAt: now,
            blockedUntil: blockedUntil,
            blockedBy: new ObjectId(decoded.id),
          },
        }
      );

      // Update all their applications to blocked status
      await db.collection("applications").updateMany(
        {
          candidateId: application.candidateId,
          status: { $in: ["applied", "in-progress"] },
        },
        {
          $set: {
            status: "blocked",
            blockedAt: now,
            blockedUntil: blockedUntil,
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: `Candidate blocked until ${blockedUntil.toISOString()}`,
        blockedUntil: blockedUntil.toISOString(),
        blockDurationHours,
      });
    }

    // ✅ UNBLOCK CANDIDATE ACTION
    if (action === "unblockCandidate") {
      const application = await db
        .collection("applications")
        .findOne({ _id: applicationId });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      // Unblock the candidate
      await db.collection("candidates").updateOne(
        { _id: application.candidateId },
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

      // Update applications back to in-progress
      await db.collection("applications").updateMany(
        { candidateId: application.candidateId, status: "blocked" },
        {
          $set: { status: "in-progress" },
          $unset: {
            blockedAt: "",
            blockedUntil: "",
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Candidate unblocked successfully",
      });
    }

    // ✅ UPDATE STATUS ACTION
    if (status) {
      const validStatuses = [
        "applied",
        "in-progress",
        "completed",
        "expired",
        "rejected",
        "blocked",
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      await db.collection("applications").updateOne(
        { _id: applicationId },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
            updatedBy: new ObjectId(decoded.id),
          },
        }
      );

      return NextResponse.json({
        success: true,
        message: "Application status updated",
      });
    }

    return NextResponse.json(
      { error: "No valid action provided" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

/**
 * Delete/Archive application
 */
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
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // Archive before deleting
    const application = await db
      .collection("applications")
      .findOne({ _id: applicationId });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Archive
    await db.collection("archived_applications").insertOne({
      ...application,
      archivedAt: new Date(),
      archivedBy: new ObjectId(decoded.id),
      archivedReason: "admin_removal",
    });

    // Delete
    await db.collection("applications").deleteOne({ _id: applicationId });

    return NextResponse.json({
      success: true,
      message: "Application removed successfully",
    });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
