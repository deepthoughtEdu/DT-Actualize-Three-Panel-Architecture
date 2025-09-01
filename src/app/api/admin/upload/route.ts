import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth"; // your JWT utility
import { ObjectId } from "mongodb";
import { uploadAudio, uploadImage } from "@/lib/uploadService";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // 🔑 Extract JWT token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "image" | "audio"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Save temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join("/tmp", file.name);
    await writeFile(tempPath, buffer);

    let result;
    if (type === "audio") {
      result = await uploadAudio(tempPath);
    } else {
      result = await uploadImage(tempPath);
    }

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     // 🔑 Extract JWT token
//     const authHeader = req.headers.get("Authorization");
//     if (!authHeader?.startsWith("Bearer ")) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token);
//     if (!decoded?.id) {
//       return NextResponse.json({ error: "Invalid token" }, { status: 401 });
//     }

//     // Fetch uploads belonging to this admin
//     const uploads = await getUploadsByAdmin(decoded.id);

//     return NextResponse.json(uploads);
//   } catch (err) {
//     console.error("Error fetching uploads:", err);
//     return NextResponse.json(
//       { error: "Failed to fetch uploads" },
//       { status: 500 }
//     );
//   }
// }
