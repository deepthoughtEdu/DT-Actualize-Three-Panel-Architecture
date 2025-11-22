import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/utils/auth";
import { ObjectId } from "mongodb";

/**
 * GET - Retrieve global WhatsApp group and admins
 */
export async function GET(req: NextRequest) {
  try {
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
    const group = await db.collection("whatsapp_group").findOne({});

    if (!group) {
      return NextResponse.json(
        { error: "WhatsApp group not configured" },
        { status: 404 }
      );
    }

    // Return only necessary fields
    const { groupLink, admins } = group;
    return NextResponse.json({ groupLink, admins });
  } catch (err) {
    console.error("Error fetching WhatsApp group:", err);
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp group" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update the global WhatsApp group and admins
 * Admin-only route
 */
export async function POST(req: NextRequest) {
  try {
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
    const { groupLink, admins } = body;

    if (!groupLink || !groupLink.includes("chat.whatsapp.com")) {
      return NextResponse.json(
        { error: "Invalid WhatsApp group link" },
        { status: 400 }
      );
    }

    if (!Array.isArray(admins)) {
      return NextResponse.json(
        { error: "Admins must be an array" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    const updateResult = await db.collection("whatsapp_group").updateOne(
      {},
      {
        $set: {
          groupLink,
          admins,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message:
        updateResult.upsertedCount > 0
          ? "WhatsApp group created"
          : "WhatsApp group updated",
    });
  } catch (err) {
    console.error("Error saving WhatsApp group:", err);
    return NextResponse.json(
      { error: "Failed to save WhatsApp group" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove the global WhatsApp group config
 * Admin-only route
 */
export async function DELETE(req: NextRequest) {
  try {
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

    const result = await db.collection("whatsapp_group").deleteOne({});

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "No WhatsApp group to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "WhatsApp group deleted",
    });
  } catch (err) {
    console.error("Error deleting WhatsApp group:", err);
    return NextResponse.json(
      { error: "Failed to delete WhatsApp group" },
      { status: 500 }
    );
  }
}
