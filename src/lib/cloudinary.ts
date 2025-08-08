import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(input: string, folder = "uploads") {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error("Cloudinary is not configured");
  }
  const res = await cloudinary.uploader.upload(input, {
    folder,
    resource_type: "image",
  });
  return { url: res.secure_url, publicId: res.public_id };
}