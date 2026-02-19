import mongoose from "mongoose";
import { User } from "./model/index.js";
import { DB_URI } from "../../config/config.service.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);

    console.log("DB connected successfully 🤩");

    await User.syncIndexes();
  } catch (error) {
    console.error("Error connecting to MongoDB");
    console.log(error.message);
  }
};
