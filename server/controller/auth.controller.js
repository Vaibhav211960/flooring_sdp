import User from "../model/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendMail } from "../utils/email.js";

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
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 15);
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetLink = `${clientUrl.replace(/\/$/, "")}/reset-password/${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Reset your password",
      text: `Reset your password using this link: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1c1917;">
          <h2 style="margin-bottom: 12px;">Reset your password</h2>
          <p>We received a request to reset your password.</p>
          <p>
            <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#1c1917;color:#fafaf9;text-decoration:none;border-radius:8px;">
              Reset Password
            </a>
          </p>
          <p>This link expires in 15 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to send reset email" });
  }
};

export const validateResetToken = async (req, res) => {
  try {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    res.status(200).json({ message: "Reset link is valid." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to validate reset link" });
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

    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to reset password" });
  }
};
