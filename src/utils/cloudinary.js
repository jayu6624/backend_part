import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import ApiError from "./ApiError.js";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUINARY_CLOUD_NAME,
  api_key: process.env.CLOUINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUINARY_CLOUD_API_SECRET,
});
const deletefile = async (localpath) => {
  if (!localpath) return null;

  try {
    fs.unlinkSync(localpath);

    if (fs.existsSync(localpath)) {
      console.error("file is not deleted in the file");
    }
  } catch (error) {
    throw ApiError(400, "we could not delete the file in catch block");
  }
};
const uploadfile = async (localpath) => {
  if (!localpath) return null;

  if (!fs.existsSync(localpath)) {
    console.error("Error: File not found:", localpath);
    return null; // Or throw an error if needed
  }

  try {
    const response = await cloudinary.uploader.upload(localpath, {
      resource_type: "auto",
    });
    console.log("File is uploaded successfully", response.url);
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    fs.unlinkSync(localpath); // Ensure the file is deleted if there's an error
    throw new ApiError(500, "Error uploading file to Cloudinary");
  }
};

export { uploadfile,deletefile };
