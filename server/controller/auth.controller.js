import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  getEmailDeliveryMode,
  getMissingEmailConfig,
  isEmailConfigured,
  sendMail,
} from "../utils/email.js";

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const buildResetEmail = ({ resetLink }) => ({
  subject: "Password Reset",
  text: [
    "We received a request to reset your password.",
    "",
    `Reset your password using this link: ${resetLink}`,
    "",
    "This link expires in 15 minutes.",
    "If you did not request a password reset, you can safely ignore this email.",
  ].join("\n"),
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917; max-width: 640px; margin: 0 auto;">
      <h2 style="margin-bottom: 12px;">Password Reset</h2>
      <p>We received a request to reset your password.</p>
      <p style="margin: 24px 0;">
        <a
          href="${resetLink}"
          style="display:inline-block;padding:12px 18px;background:#1c1917;color:#fafaf9;text-decoration:none;border-radius:8px;font-weight:700;"
        >
          Reset Password
        </a>
      </p>
      <p>This link expires in <strong>15 minutes</strong>.</p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p style="word-break: break-all; color: #57534e;">${resetLink}</p>
    </div>
  `,
});

const getEmailFailureMessage = (error) => {
  const rawMessage = String(error?.response || error?.message || "").trim();

  if (
    error?.responseCode === 535 ||
    /badcredentials|invalid login|username and password not accepted/i.test(rawMessage)
  ) {
    return "Gmail SMTP login failed. Update SMTP_USER and SMTP_PASS in server/.env with a valid Gmail address and app password. A preview reset link was generated for local testing.";
  }

  return "Email delivery failed, so a preview reset link was generated for local testing.";
};

const getPreviewModeMessage = () => {
  return "Local email preview mode is enabled, so a preview reset link was generated for testing.";
};

/**
 * Register user
 */
export const registerUser = async (req, res) => {
  console.log(req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const usernameExists = await User.findOne({ userName: name });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    // console.log("hell");


    const user = await User.create({
      userName: name,
      email,
      password: hashedPassword,
    });

    await user.save();
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
    alert("Error occurred during registration", err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id }, // This "id" becomes req.user.id
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If an account exists for that email, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = hashResetToken(rawToken);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl.replace(/\/$/, "")}/reset-password/${rawToken}`;
    const deliveryMode = getEmailDeliveryMode();

    if (deliveryMode !== "preview" && !isEmailConfigured()) {
      if (process.env.NODE_ENV === "production") {
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();

        return res.status(500).json({
          message: `SMTP is not configured. Missing: ${getMissingEmailConfig().join(", ")}`,
        });
      }

      return res.status(200).json({
        message: "SMTP is not configured, so a preview reset link was generated for local testing.",
        previewResetLink: resetLink,
      });
    }

    try {
      const emailContent = buildResetEmail({ resetLink });
      const delivery = await sendMail({
        to: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      if (delivery?.mode === "preview") {
        return res.status(200).json({
          message: getPreviewModeMessage(),
          previewResetLink: resetLink,
        });
      }
    } catch (error) {
      console.error("Forgot password email send failed:", error?.message || error);

      if (process.env.NODE_ENV !== "production") {
        return res.status(200).json({
          message: getEmailFailureMessage(error),
          previewResetLink: resetLink,
        });
      }

      return res.status(500).json({
        message: "Failed to send reset email. Please try again later.",
      });
    }

    res.status(200).json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to send reset email" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const hashedToken = hashResetToken(req.params.token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reset password" });
  }
};
