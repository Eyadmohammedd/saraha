import mongoose from "mongoose";
import { User } from "./model/index.js";
import { dbConfig } from "../../config/config.service.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.uri);

    console.log("DB connected successfully 🤩");

    await User.syncIndexes();
  } catch (error) {
    console.error("Error connecting to MongoDB");
    console.log(error.message);
  }
};