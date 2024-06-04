import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
import APIerror from './Apierror.js';
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUINARY_CLOUD_NAME,
    api_key: process.env.CLOUINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUINARY_CLOUD_API_SECRET,
});

const uploadfile = async (localpath) => {
    if (!localpath) return null;

    if (!fs.existsSync(localpath)) {
        console.error("Error: File not found:", localpath);
        return null; // Or throw an error if needed
      }

    try {
        const response = await cloudinary.uploader.upload(localpath, {
            resource_type: "auto"
        });
        console.log("File is uploaded successfully", response.url);
        return response;
    } catch (error) {
        console.error("Error uploading file:", error);
        fs.unlinkSync(localpath); // Ensure the file is deleted if there's an error
        throw new APIerror(500, "Error uploading file to Cloudinary");
    }
};

export { uploadfile };