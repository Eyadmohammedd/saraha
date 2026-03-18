import { Router } from "express";
import { authentication } from "../../common/middleware/auth.middleware.js";
import * as userService from "./user.service.js";
import { uploadMultipleImages } from "../../common/utils/multer.config.js";
import { uploadProfilePicture } from "../../common/utils/multer.config.js";
import { authorization } from "../../common/middleware/authorization.middleware.js";
import { User } from "../../DB/model/user.model.js";
const router = Router();
router.get("/profile", authentication, async (req, res, next) => {
  try {
    const user = await userService.profile(req.user._id);

    res.status(200).json({
      statusCode: 200,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/upload-picture",
  (req, res, next) => {
    uploadProfilePicture(req, res, function (err) {
      if (err) {
        console.log("MULTER ERROR:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    res.json({ file: req.file });
  },
);

router.get(
  "/all-users",
  authentication,
  authorization(["ADMIN"]),
  async (req, res, next) => {
    try {
      const users = await User.find(); // أو service

      res.status(200).json({
        statusCode: 200,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },
);
// ================= SHARED PROFILE =================
router.get("/profile/:id", async (req, res, next) => {
  try {
    const user = await userService.sharedProfile(req.params.id);

    res.status(200).json({
      statusCode: 200,
      message: "Shared profile fetched",
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// ================= UPLOAD COVER =================

router.post(
  "/upload-cover",
  (req, res, next) => {
    uploadMultipleImages(req, res, function (err) {
      if (err) {
        console.log("MULTER ERROR:", err);
        return res.status(400).json({ error: err.message });
      }
      next();
    });
  },
  (req, res) => {
    console.log("FILES:", req.files);
    res.json({ files: req.files });
  },
);
export default router;
