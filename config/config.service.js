import { resolve } from "node:path";
import { config } from "dotenv";
import fs from "fs";

export const NODE_ENV = process.env.NODE_ENV || "development";

const envPath = {
  development: ".env.development",
  production: ".env.production",
};

config({
  path: resolve(`./config/${envPath[NODE_ENV]}`),
});

// ================= APP =================
export const appConfig = {
  port: process.env.PORT || 3000,
};

// ================= DB =================
export const dbConfig = {
  uri: process.env.DB_URI,
};

// ================= SECURITY =================
export const securityConfig = {
  saltRounds: Number(process.env.SALT_ROUND) || 10,
  ivLength: Number(process.env.IV_LENGTH) || 16,
  encKey: process.env.ENC_SECRET_KEY,
};

// ================= JWT (RS256) =================
export const jwtConfig = {
  privateKey: fs.readFileSync("./config/private.key", "utf8"),
  publicKey: fs.readFileSync("./config/public.key", "utf8"),
  accessExpiresIn: "15m",
  refreshExpiresIn: "7d",
};

// ================= EMAIL =================
export const emailConfig = {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};
// ================= upload =================
export const uploadConfig = {
  allowedImageTypes: ["image/jpeg", "image/png", "image/jpg"],
  maxFileSize: 2 * 1024 * 1024, // 2MB
};
uploadDir: "./uploads"