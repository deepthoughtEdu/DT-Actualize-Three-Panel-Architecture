export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/uploadService";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    // const type = formData.get("type") as string; // "image" | "audio"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Save temp file
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log("File size:", buffer.length);
    const result = await uploadFile(buffer);

    // if (type === "audio") {
    //   result = await uploadAudio(buffer);
    // } else if (type === "image") {
    //   result = await uploadImage(buffer);
    // } else {
    //   // generic file upload (pdf, docx, zip, etc.)
    //   result = await uploadFile(buffer)
    // }

    console.log("Upload result:", result.secure_url);

    return NextResponse.json({ url: result.secure_url });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
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
