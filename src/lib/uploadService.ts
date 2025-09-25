import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, any>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result as UploadApiResponse);
    });
    stream.end(buffer);
  });
}

export async function uploadImage(buffer: Buffer): Promise<UploadApiResponse> {
  console.log('Uploading Image');
  return uploadBuffer(buffer, {
    folder: "myapp/images",
    resource_type: "image"
  });
}

export async function uploadFile(buffer: Buffer, filename?: string): Promise<UploadApiResponse> {
  console.log('Uploading File');
  return uploadBuffer(buffer, {
    folder: "myapp/files",
    resource_type: "auto",
    use_filename: !!filename,
    unique_filename: !filename,
    access_mode: "public",
  });
}

export async function uploadAudio(buffer: Buffer): Promise<UploadApiResponse> {
  console.log('Uploading Audio');
  return uploadBuffer(buffer, {
    folder: "myapp/audio",
    resource_type: "video", // Cloudinary treats audio as video
    format: "mp3",
  });
}

export async function deleteFile(publicId: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.destroy(publicId);
}