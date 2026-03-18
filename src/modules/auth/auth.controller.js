import { Router } from "express";
import * as authService from "./auth.service.js";

import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from "./auth.validation.js";

import { validate } from "../../common/utils/validation.middleware.js";
import { addToBlacklist } from "../../common/utils/tokenBlacklist.js";
import { authentication } from "../../common/middleware/auth.middleware.js";
const router = Router();

// ================= SIGNUP =================
router.post("/signup", validate(signupSchema), async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);

    res.status(201).json({
      statusCode: 201,
      message: result.message,
      data: {
        email: result.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ================= VERIFY OTP =================
router.post(
  "/verify-otp",
  validate(verifyOtpSchema),
  async (req, res, next) => {
    try {
      const result = await authService.verifyOtp(req.body);

      res.status(200).json({
        statusCode: 200,
        message: result.message,
        data: {
          email: result.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ================= RESEND OTP =================
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  async (req, res, next) => {
    try {
      const result = await authService.resendOtp(req.body);

      res.status(200).json({
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ================= LOGIN =================
router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    res.status(200).json({
      statusCode: 200,
      message: result.message,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
});
router.post("/google-login", async (req, res, next) => {
  try {
    const result = await authService.googleLogin(req.body.idToken);

    res.status(200).json({
      statusCode: 200,
      message: "Google login success",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
router.post("/logout", authentication, (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    addToBlacklist(token);

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});
export default router;