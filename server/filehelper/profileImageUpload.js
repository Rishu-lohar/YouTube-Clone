import { randomUUID } from "crypto";
import multer from "multer";

const imageExtensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    const extension = imageExtensions[file.mimetype];
    cb(null, `profile-${Date.now()}-${randomUUID()}.${extension}`);
  },
});

const profileImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, Boolean(imageExtensions[file.mimetype]));
  },
});

export default profileImageUpload;
