import { generateHash, compareHash } 
from "../../common/utils/Security/hash.security.js";

import { generateEncryption } 
from "../../common/utils/Security/encryption.security.js";

import { generateAccessToken, generateRefreshToken } 
from "../../common/utils/Security/token.security.js";

import { sendEmail, generateOTP } from "./email.service.js";

import { findOne, create, findOneAndUpdate } 
from "../../DB/model/database.repository.js";

import { User } 
from "../../DB/model/user.model.js";

// ================= SIGNUP =================
export const signup = async (inputs) => {
  const { firstName, lastName, email, password, phone } = inputs;

  const existingUser = await findOne({
    model: User,
    filter: { email },
  });

  if (existingUser) throw new Error("Email already exists");

  const hashedPassword = await generateHash(password);
  const encryptedPhone = await generateEncryption(phone);

  const otp = generateOTP();

  await create({
    model: User,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: JSON.stringify(encryptedPhone),
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      otpAttempts: 0,
      isVerified: false,
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your account",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });

  return { message: "Signup successful, check your email" };
};

// ================= VERIFY OTP =================
export const verifyOtp = async ({ email, otp }) => {

  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("Already verified");

  if (user.otpAttempts >= 5) {
    throw new Error("Too many attempts");
  }

  if (user.otp !== otp) {
    await findOneAndUpdate({
      model: User,
      filter: { email },
      update: { $inc: { otpAttempts: 1 } },
    });
    throw new Error("Invalid OTP");
  }

  if (Date.now() > user.otpExpires) {
    throw new Error("OTP expired");
  }

  await findOneAndUpdate({
    model: User,
    filter: { email },
    update: {
      isVerified: true,
      otp: null,
      otpExpires: null,
      otpAttempts: 0,
    },
  });

  return { message: "Verified successfully" };
};

// ================= LOGIN =================
export const login = async ({ email, password }) => {

  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("Email not found");

  if (!user.isVerified) {
    throw new Error("Verify your account first");
  }

  const match = await compareHash(password, user.password);
  if (!match) throw new Error("Wrong password");

  const accessToken = generateAccessToken({
    id: user._id,
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return { accessToken, refreshToken };
};