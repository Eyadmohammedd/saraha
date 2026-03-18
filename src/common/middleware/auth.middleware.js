import { verifyAccessToken } from "../utils/Security/token.security.js";
import { User } from "../../DB/model/user.model.js";
import { isBlacklisted } from "../utils/tokenBlacklist.js";

export const authentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next(new Error("No token provided", { cause: { status: 401 } }));
    }

    const token = authHeader.split(" ")[1];

    // ✅ IMPORTANT: await لو async
    const blacklisted = await isBlacklisted(token);

    if (blacklisted) {
      return next(new Error("Token revoked", { cause: { status: 401 } }));
    }

    let decoded;

    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new Error("Invalid or expired token", { cause: { status: 401 } }));
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new Error("User not found", { cause: { status: 401 } }));
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    next(new Error("Unauthorized", { cause: { status: 401 } }));
  }
};