import crypto from "node:crypto";
import { securityConfig } from "../../../../config/config.service.js";

export const generateEncryption = async (plainText) => {

  if (!plainText || typeof plainText !== "string") {
    throw new Error("Plain text must be a valid string");
  }

  if (!securityConfig.encKey || securityConfig.encKey.length !== 32) {
    throw new Error("ENC_SECRET_KEY must be 32 characters long");
  }

  const IV = crypto.randomBytes(securityConfig.ivLength);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(securityConfig.encKey),
    IV
  );

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: IV.toString("hex"),
    encryptedData: encrypted
  };
};

export const decryptData = (payload) => {

  const { iv, encryptedData } = JSON.parse(payload);

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(securityConfig.encKey),
    Buffer.from(iv, "hex")
  );

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};