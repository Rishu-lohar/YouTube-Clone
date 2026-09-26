import fs from "fs/promises";
import path from "path";

export const uploadsDirectory = path.resolve(
  process.env.UPLOADS_DIR || "uploads"
);

export const ensureUploadsDirectory = async (callback) => {
  try {
    await fs.mkdir(uploadsDirectory, { recursive: true });
    callback(null, uploadsDirectory);
  } catch (error) {
    callback(error);
  }
};
