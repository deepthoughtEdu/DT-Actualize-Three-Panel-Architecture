import { NextRequest, NextResponse } from "next/server";
import { getProcessById, updateProcess } from "@/lib/processService";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/utils/auth";
import { getAdminById } from "@/lib/adminService";
import { Round } from "@/types";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     // ✅ Authorization header
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json(
//         { error: "Unauthorized: Missing token" },
//         { status: 401 }
//       );
//     }

//     // ✅ Decode token
//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken<{ id: string }>(token);
//     if (!decoded?.id) {
//       return NextResponse.json(
//         { error: "Unauthorized: Invalid token" },
//         { status: 401 }
//       );
//     }

//     // ✅ Ensure admin exists
//     const admin = await getAdminById(decoded.id);
//     if (!admin) {
//       return NextResponse.json(
//         { error: "Forbidden: Not an admin" },
//         { status: 403 }
//       );
//     }
//     // --- round creation logic ---
//     const processId = params.id;
//     const { title, type, fields } = await req.json();

//     const process = await getProcessById(processId);
//     if (!process) {
//       return NextResponse.json(
//         { error: "Process not found" },
//         { status: 404 }
//       );
//     }

//     const newRoundId = new ObjectId();
//     const newRound = {
//       _id: newRoundId,
//       order: process.rounds.length + 1,
//       title: title || "Untitled Round",
//       type: type || "form",
//       fields: fields || [],
//     };

//     const updatedRounds = [...process.rounds, newRound];
//     await updateProcess(processId, { rounds: updatedRounds });

//     return NextResponse.json({
//       message: "Round created successfully",
//       roundId: newRoundId.toString(),
//     });
//   } catch (err) {
//     console.error("Error creating round:", err);
//     return NextResponse.json(
//       { error: "Failed to create round" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    // ✅ Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing token" },
        { status: 401 }
      );
    }

    // ✅ Decode token
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken<{ id: string }>(token);
    if (!decoded?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // ✅ Ensure admin exists
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden: Not an admin" },
        { status: 403 }
      );
    }

    // --- round creation logic ---
    const processId = params.id;
    const body = await req.json();
    const { title, type, fields, instruction } = body;

    const process = await getProcessById(processId);
    if (!process) {
      return NextResponse.json({ error: "Process not found" }, { status: 404 });
    }

    // ✅ Construct the new round properly
    const newRoundId = new ObjectId().toString();
    let newRound: Round;

    if (type === "form") {
      newRound = {
        _id: newRoundId,
        order: process.rounds.length + 1,
        title: title || "Untitled Form Round",
        type: "form",
        fields: fields || [], // must be an array of Field[]
      };
    } else if (type === "instruction") {
      newRound = {
        _id: newRoundId,
        order: process.rounds.length + 1,
        title: title || "Instruction Round",
        type: "instruction",
        instruction: instruction || "",
      };
    } else {
      return NextResponse.json(
        { error: "Invalid round type" },
        { status: 400 }
      );
    }

    const updatedRounds = [...process.rounds, newRound];
    await updateProcess(processId, { rounds: updatedRounds });

    return NextResponse.json({
      message: "Round created successfully",
      roundId: newRoundId.toString(),
    });
  } catch (err) {
    console.error("Error creating round:", err);
    return NextResponse.json(
      { error: "Failed to create round" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;   // 👈 await params
    const process = await getProcessById(id);

    if (!process) {
      return NextResponse.json(
        { error: "Process not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(process.rounds || []);
  } catch (err) {
    console.error("Error fetching rounds:", err);
    return NextResponse.json(
      { error: "Failed to fetch rounds" },
      { status: 500 }
    );
  }
}

