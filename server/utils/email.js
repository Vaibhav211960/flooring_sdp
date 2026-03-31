import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    const missingKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].filter(
      (key) => !process.env[key]
    );
    throw new Error(`SMTP configuration is missing. Set ${missingKeys.join(", ")}.`);
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === "true" || Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
};
