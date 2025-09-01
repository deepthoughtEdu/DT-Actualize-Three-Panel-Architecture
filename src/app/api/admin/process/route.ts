import { NextRequest, NextResponse } from "next/server";
import { createProcess, getAllProcesses, getProcessesByAdmin } from "@/lib/processService";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";

// export async function GET(req: NextRequest) {
//   try {
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);

//     if (!decoded?.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     const processes = await getProcessesByAdmin(decoded.id);
//     return NextResponse.json(processes);
//   } catch (err) {
//     console.error("Error fetching processes:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch processes" },
//       { status: 500 }
//     );
//   }
// }


// ✅ GET: Fetch processes for the logged-in admin
// export async function GET(req: NextRequest) {
//   try {
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Verify JWT
//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);

//     if (!decoded?.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     // ✅ Ensure this ID is a valid admin
//     const admin = await getAdminById(decoded.id);
//     if (!admin) {
//       return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
//     }

//     // ✅ Fetch only processes created by this admin
//     const processes = await getProcessesByAdmin(decoded.id);
//     return NextResponse.json(processes);

//   } catch (err) {
//     console.error("Error fetching processes:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch processes" },
//       { status: 500 }
//     );
//   }
// }


// ✅ GET: Fetch all processes (not just for one admin)
export async function GET(req: NextRequest) {
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

    // (Optional) You may still want to ensure only admins can access all
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
    }

    // ✅ Fetch ALL processes
    const processes = await getAllProcesses();
    return NextResponse.json(processes);

  } catch (err) {
    console.error("Error fetching processes:", err);
    return NextResponse.json(
      { error: "Failed to fetch processes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const data = await req.json();

    if (!data.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newProcess = {
      title: data.title,
      description: data.description || "",
      rounds: data.rounds || [],
      adminId: decoded.id, // ✅ from JWT
      status: data.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertedId = await createProcess(newProcess);

    return NextResponse.json(
      { _id: insertedId, ...newProcess },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating process:", err);
    return NextResponse.json(
      { error: "Failed to create process" },
      { status: 500 }
    );
  }
}
