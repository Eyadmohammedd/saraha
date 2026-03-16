import jwt from "jsonwebtoken";
import { jwtConfig } from "../../../../config/config.service.js";
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.privateKey, {
    algorithm: "RS256",
    expiresIn: jwtConfig.accessExpiresIn,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.privateKey, {
    algorithm: "RS256",
    expiresIn: jwtConfig.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.publicKey, {
    algorithms: ["RS256"],
  });
};