import { generateHash, compareHash } 
from "../../common/utils/Security/hash.security.js";

import { generateEncryption } 
from "../../common/utils/Security/encryption.security.js";

import { generateAccessToken, generateRefreshToken } 
from "../../common/utils/Security/token.security.js";

import { sendEmail } from "./email.service.js";


import { findOne, create, findOneAndUpdate } 
from "../../DB/model/database.repository.js";

import { User } 
from "../../DB/model/user.model.js";


// ================= SIGNUP =================
export const signup = async (inputs) => {
  const { firstName, lastName, email, password, phone } = inputs;

  // check existing user
  const existingUser = await findOne({
    model: User,
    filter: { email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // hash password
  const hashedPassword = await generateHash(password);

  // encrypt phone
  const encryptedPhone = await generateEncryption(phone);

  // generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // create user
  const user = await create({
    model: User,
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: JSON.stringify(encryptedPhone),
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000, // 10 min
      isVerified: false,
    },
  });

  // send OTP email
  await sendEmail(
    email,
    "Verify your account",
    `<h2>Your OTP is: ${otp}</h2>`
  );

  return { message: "Signup successful, please verify OTP" };
};


// ================= VERIFY OTP =================
export const verifyOtp = async ({ email, otp }) => {

  const user = await findOne({
    model: User,
    filter: { email },
  });

  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("Account already verified");

  if (user.otp !== Number(otp)) {
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
    email: user.email,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
  });

  return {
    accessToken,
    refreshToken,
  };
};
