import { resolve } from "node:path";
import { config } from "dotenv";

export const NODE_ENV = process.env.NODE_ENV || "development";

const envPath = {
  development: ".env.development",
  production: ".env.production",
};

config({
  path: resolve(`./config/${envPath[NODE_ENV]}`),
});

export const port = process.env.PORT ?? 7000;
export const DB_URI = process.env.DB_URI;

export const SALT_ROUND = Number(process.env.SALT_ROUND) || 10;
export const IV_LENGTH = Number(process.env.IV_LENGTH) || 16;

export const ENC_SECRET_KEY = process.env.ENC_SECRET_KEY;
