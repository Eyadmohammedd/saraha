import {
  findOne,
  findOneAndUpdate,
} from "../../DB/model/database.repository.js";
import { User } from "../../DB/model/user.model.js";

// ================= PROFILE =================
export const profile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
    role: user.role,
  };
};

// ================= UPLOAD PROFILE PICTURE =================
export const uploadProfilePicture = async (userId, file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const user = await findOne({
    model: User,
    filter: { _id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const filePath = `/uploads/profile-pictures/${file.filename}`;

  const updatedUser = await findOneAndUpdate({
    model: User,
    filter: { _id: userId },
    update: {
      profilePicture: filePath,
    },
  });

  return {
    message: "Profile picture uploaded successfully",
    filePath,
    user: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      profilePicture: filePath,
    },
  };
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (userId, updateData) => {
  const allowedUpdates = ["firstName", "lastName", "gender"];

  const sanitizedData = {};

  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      sanitizedData[key] = updateData[key];
    }
  });

  const updatedUser = await findOneAndUpdate({
    model: User,
    filter: { _id: userId },
    update: sanitizedData,
  });

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return {
    message: "Profile updated successfully",
    user: {
      id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      gender: updatedUser.gender,
    },
  };
};
// ================= SHARED PROFILE =================
export const sharedProfile = async (userId) => {
  const user = await User.findById(userId).select(
    "firstName lastName profilePicture coverprofilePicture"
  );

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// ================= UPLOAD COVER PICTURES =================
export const uploadCoverPictures = async (userId, files) => {
  if (!files || files.length === 0) {
    throw new Error("No files uploaded");
  }

  const user = await findOne({
    model: User,
    filter: { _id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const paths = files.map(
    (file) => `/uploads/profile-pictures/${file.filename}`
  );

  const updatedUser = await findOneAndUpdate({
    model: User,
    filter: { _id: userId },
    update: {
      $push: { coverprofilePicture: { $each: paths } },
    },
  });

  return {
    message: "Cover pictures uploaded successfully",
    paths,
    user: updatedUser,
  };
};