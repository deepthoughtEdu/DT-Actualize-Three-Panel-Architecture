import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";

/**
 * Get single application details (Admin)
 */
export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    // ✅ Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string; role: string }>(token);

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // ✅ Fetch application with candidate and process details
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
 * Update application status (Admin)
 * Used to mark applications as expired, rejected, etc.
 */
export async function PATCH(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    // ✅ Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string; role: string }>(token);

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status, reason } = body;

    // ✅ Validate status
    const validStatuses = [
      "applied",
      "in-progress",
      "completed",
      "expired",
      "rejected",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // ✅ Check if application exists
    const existingApp = await db
      .collection("applications")
      .findOne({ _id: applicationId });

    if (!existingApp) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // ✅ Update application status
    const updateData: any = {
      status: status,
      updatedAt: new Date(),
      updatedBy: new ObjectId(payload.id),
    };

    if (reason) {
      updateData.statusReason = reason;
    }

    const result = await db
      .collection("applications")
      .updateOne({ _id: applicationId }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      status: status,
    });
  } catch (err) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

/**
 * Delete application (Admin)
 * Archives the application before deleting for record-keeping
 */
export async function DELETE(req: NextRequest, context: any) {
  try {
    const params = await context.params;

    // ✅ Verify admin authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken<{ id: string; role: string }>(token);

    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const db = await connectDB();
    const applicationId = new ObjectId(params.id);

    // ✅ Fetch application before deleting
    const application = await db
      .collection("applications")
      .findOne({ _id: applicationId });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // ✅ Archive the application before deletion
    try {
      await db.collection("archived_applications").insertOne({
        ...application,
        archivedAt: new Date(),
        archivedBy: new ObjectId(payload.id),
        archivedReason: "admin_removal",
        originalId: application._id,
      });
    } catch (archiveErr) {
      console.error("Failed to archive application:", archiveErr);
      // Continue with deletion even if archiving fails
    }

    // ✅ Delete from main collection
    const result = await db
      .collection("applications")
      .deleteOne({ _id: applicationId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application removed successfully",
      archived: true,
    });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
