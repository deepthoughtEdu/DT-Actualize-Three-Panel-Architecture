import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

export async function uploadImage(filePath: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(filePath, {
    folder: "myapp/images",
    resource_type: "image",
  });
}

export async function uploadFile(
  filePath: string,
): Promise<UploadApiResponse> {
  return cloudinary.uploader.upload(filePath, {
    folder: "myapp/files",
    use_filename: true,
    unique_filename: false,
    access_mode: 'public',
    resource_type: "raw"
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


