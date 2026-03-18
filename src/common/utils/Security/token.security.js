import jwt from "jsonwebtoken";
import { jwtConfig } from "../../../../config/config.service.js";

export const generateAccessToken = ({ id, role }) => {
  return jwt.sign(
    { id, role },
    jwtConfig.privateKey,
    {
      algorithm: "RS256",
      expiresIn: jwtConfig.accessExpiresIn,
      audience: role === "ADMIN" ? "admin" : "user",
    }
  );
};

export const generateRefreshToken = ({ id, role }) => {
  return jwt.sign(
    { id, role },
    jwtConfig.privateKey,
    {
      algorithm: "RS256",
      expiresIn: jwtConfig.refreshExpiresIn,
      audience: role === "ADMIN" ? "admin" : "user",
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: ["RS256"],
  });
};