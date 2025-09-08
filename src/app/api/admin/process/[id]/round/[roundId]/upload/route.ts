import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { uploadImage, uploadAudio } from "@/lib/uploadService";
import { addRoundInstructionUpload } from "@/lib/processService";

export async function POST(
  req: NextRequest,
  context: { params: { id: string; roundId: string } }
) {
  try {
    const { id, roundId } = await context.params;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "image" | "audio"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // save temp file
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempPath = path.join("/tmp", file.name);
    await writeFile(tempPath, buffer);

    // upload to Cloudinary
    let result;
    if (type === "audio") {
      result = await uploadAudio(tempPath);
    } else {
      result = await uploadImage(tempPath);
    }

    // save metadata inside round.uploads
    await addRoundInstructionUpload(id, roundId, {
      url: result.secure_url,
      type,
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
