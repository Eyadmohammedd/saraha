import {
  generateHash,
  compareHash,
} from "../../common/utils/Security/hash.security.js";
import { OAuth2Client } from "google-auth-library";
import { generateEncryption } from "../../common/utils/Security/encryption.security.js";

import {
  generateAccessToken,
  generateRefreshToken,
} from "../../common/utils/Security/token.security.js";

import {
  sendEmail,
  generateOTP,
} from "./email.service.js";

import {
  findOne,
  create,
  findOneAndUpdate,
} from "../../DB/model/database.repository.js";

import { User } from "../../DB/model/user.model.js";

import { securityConfig } from "../../../config/config.service.js";

// ================= CONSTANTS =================
const OTP_TTL = 10 * 60 * 1000; // 10 min
const MAX_OTP_ATTEMPTS = 5;

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
  const hashedOtp = await generateHash(otp.toString());

  await create({
    model: User,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: JSON.stringify(encryptedPhone),
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + OTP_TTL),
      otpAttempts: 0,
      isVerified: false,
    },
  });

  await sendEmail({
    to: email,
    subject: "Verify your account",
    html: `<h2>Your OTP is: ${otp}</h2>`,
  });

  return {
    message: "Signup successful! Check your email for OTP",
    email,
  };
};

// ================= RESEND OTP =================
export const resendOtp = async ({ email }) => {
  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("User not found");

  if (user.isVerified) {
    throw new Error("Account already verified");
  }

  const otp = generateOTP();
  const hashedOtp = await generateHash(otp.toString());

  await findOneAndUpdate({
    model: User,
    filter: { email },
    update: {
      otp: hashedOtp,
      otpExpires: new Date(Date.now() + OTP_TTL),
      otpAttempts: 0,
    },
  });

  await sendEmail({
    to: email,
    subject: "Resend OTP",
    html: `<h2>Your new OTP is: ${otp}</h2>`,
  });

  return { message: "OTP resent successfully" };
};

// ================= VERIFY OTP =================
export const verifyOtp = async ({ email, otp }) => {
  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("Already verified");

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("Too many attempts, request new OTP");
  }

  if (new Date() > user.otpExpires) {
    throw new Error("OTP expired");
  }

  const isValid = await compareHash(otp, user.otp);

  if (!isValid) {
    await findOneAndUpdate({
      model: User,
      filter: { email },
      update: { $inc: { otpAttempts: 1 } },
    });

    throw new Error("Invalid OTP");
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

  return { message: "Account verified successfully" };
};

// ================= LOGIN =================
export const login = async ({ email, password }) => {
  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("Email not found");

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  const match = await compareHash(password, user.password);
  if (!match) throw new Error("Incorrect password");

  const accessToken = generateAccessToken({
    id: user._id,
  role: user.role,
});

  const refreshToken = generateRefreshToken({
   id: user._id,
  role: user.role,
  });

  return {
    message: "Login successful",
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  let user = await findOne({
    model: User,
    filter: { email: payload.email },
  });

  if (!user) {
    user = await create({
      model: User,
      data: {
        firstName: payload.given_name,
        lastName: payload.family_name || "GoogleUser",
        email: payload.email,
        isVerified: true,
        Provider: 1,
        role: "USER",
      },
    });
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
  });

  return { accessToken, refreshToken };
};