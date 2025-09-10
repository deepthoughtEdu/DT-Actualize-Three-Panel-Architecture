import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { addRoundInstructionUpload, deleteRoundInstructionUpload } from "@/lib/processService";
import { deleteFile, uploadAudio, uploadImage } from "@/lib/uploadService";

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

    // console.log(result.secure_url);
    
    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string; roundId: string } }
) {
  try {
    const { id, roundId } = context.params;
    const { searchParams } = new URL(req.url);
    let fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    // Remove extra quotes if present
    fileUrl = fileUrl.replace(/^'+|'+$/g, '');

    console.log("File URL:", fileUrl);

    // Extract public_id from the URL
    const urlParts = fileUrl.split("/");
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const [publicId] = filenameWithExtension.split(".");

    console.log("Public ID:", publicId);

    // Delete from Cloudinary
    const result = await deleteFile(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary deletion error:", result);
      return NextResponse.json({ error: "Cloudinary deletion failed" }, { status: 500 });
    }

    // Delete from database
    await deleteRoundInstructionUpload(id, roundId, fileUrl);

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
