import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Upload buffer to Cloudinary
export const uploadToCloudinary = async (
  file: Blob | null,
  folder = "ElectroMart",
): Promise<UploadApiResponse> => {
  if (!file) {
    throw new Error("File is null");
  }
  const fileBuffer = file ? Buffer.from(await file.arrayBuffer()) : null;

  if (!fileBuffer) {
    throw new Error("File buffer is null");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      },
    );
    stream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publick_id: string) => {
  if (!publick_id) {
    throw new Error("Public ID is required");
  }
  try {
    const result = await cloudinary.uploader.destroy(publick_id, {
      resource_type: "image",
    });

    return result;
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
    throw error;
  }
};
