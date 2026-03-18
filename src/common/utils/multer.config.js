import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadConfig } from "../../../config/config.service.js";
const uploadDir = "./uploads";

const profilePicturesDir = `${uploadDir}/profile-pictures`;
const coverPicturesDir = `${uploadDir}/cover-pictures`;

// create folders
[profilePicturesDir, coverPicturesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ================= STORAGE =================
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilePicturesDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.random();
    cb(null, unique + path.extname(file.originalname));
  },
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, coverPicturesDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.random();
    cb(null, unique + path.extname(file.originalname));
  },
});
// ================= FILTER =================
const fileFilter = (req, file, cb) => {
  if (uploadConfig.allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

// ================= UPLOAD =================
export const uploadProfilePicture = multer({
  storage: profileStorage,
}).single("profilePicture");

export const uploadMultipleImages = multer({
  storage: coverStorage,
}).array("images", 5);
