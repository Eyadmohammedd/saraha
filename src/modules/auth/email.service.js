import nodemailer from "nodemailer";
import { emailConfig } from "../../../config/config.service.js";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  return await transporter.sendMail({
    from: `"Saraha App" <${emailConfig.user}>`,
    to,
    subject,
    html,
  });
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};