import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const REQUIRED_SMTP_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
const SMTP_MODE = "smtp";
const PREVIEW_MODE = "preview";

const isPlaceholderValue = (value) => {
  const normalizedValue = String(value || "").trim().toLowerCase();

  if (!normalizedValue) {
    return true;
  }

  return [
    "your_",
    "example",
    "changeme",
    "replace",
    "placeholder",
    "<smtp",
    "<mail",
  ].some((pattern) => normalizedValue.includes(pattern));
};

export const getMissingEmailConfig = () =>
  REQUIRED_SMTP_KEYS.filter((key) => {
    return isPlaceholderValue(process.env[key]);
  });

export const isEmailConfigured = () => getMissingEmailConfig().length === 0;

export const getEmailDeliveryMode = () => {
  const explicitMode = String(process.env.EMAIL_DELIVERY_MODE || "")
    .trim()
    .toLowerCase();

  if (explicitMode === SMTP_MODE || explicitMode === PREVIEW_MODE) {
    return explicitMode;
  }

  return process.env.NODE_ENV === "production" ? SMTP_MODE : PREVIEW_MODE;
};

const getTransporter = () => {
  // FIX 1: Don't reuse cached transporter — always create a fresh one.
  // Previously, a broken transporter would be permanently cached and
  // every future send attempt would silently reuse it and fail.
  const missingKeys = getMissingEmailConfig();
  if (missingKeys.length > 0) {
    throw new Error(`SMTP configuration is missing. Set ${missingKeys.join(", ")}.`);
  }

  // FIX 2: Added tls options required for Gmail on port 587 (STARTTLS).
  // Without this, Node.js can fail with a TLS handshake or certificate error.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Prevents TLS certificate errors in dev
    },
  });

  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  const deliveryMode = getEmailDeliveryMode();
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;

  if (deliveryMode === PREVIEW_MODE) {
    console.log("[MAIL_PREVIEW]", {
      from,
      to,
      subject,
      text,
    });

    return {
      mode: PREVIEW_MODE,
      accepted: [to],
    };
  }

  const transporter = getTransporter();

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });

  return {
    mode: SMTP_MODE,
    info,
  };
};
