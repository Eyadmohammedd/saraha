import { Router } from "express";
import * as authService from "./auth.service.js";

const router = Router();

router.post("/signup", async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({ message: "User created", result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ message: "Login success", result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
