import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

export async function uploadImage(filePath: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(filePath, {
    folder: "myapp/images",
    resource_type: "image",
  });
}

export async function uploadAudio(filePath: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(filePath, {
    folder: "myapp/audio",
    resource_type: "video", // Cloudinary treats audio as video
    format: "mp3",
  });
}

export async function deleteFile(publicId: string): Promise<UploadApiResponse>{
  return cloudinary.uploader.destroy(publicId);
}


