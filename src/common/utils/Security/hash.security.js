import { securityConfig } from "../../../../config/config.service.js";
import { genSalt, hash, compare } from "bcrypt";

export const generateHash = async (
  plaintext,
  salt = securityConfig.saltRounds,
  minor = "b"
) => {
  if (!plaintext || typeof plaintext !== "string") {
    throw new Error("Password must be a valid string");
  }

  const generatedSalt = await genSalt(Number(salt), minor);
  return await hash(plaintext, generatedSalt);
};

export const compareHash = async (plaintext, hashed) => {
  return await compare(plaintext, hashed);
};