import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const router = express.Router();

// In-memory storage for OTPs and pending registrations (use Redis or DB in production)
const otps = new Map();
const pendingRegistrations = new Map();

// Nodemailer setup with Gmail + App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email with styled HTML
const sendOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Admin Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Admin Authentication</h2>
          <p style="color: #555; font-size: 16px;">Hello,</p>
          <p style="color: #555; font-size: 16px;">Your one-time password (OTP) for verification is:</p>
          <div style="background-color: #fff; padding: 15px; text-align: center; border-radius: 8px; border: 1px solid #ddd;">
            <h3 style="color: #4f46e5; font-size: 24px; margin: 0;">${otp}</h3>
          </div>
          <p style="color: #555; font-size: 14px; margin-top: 20px;">This OTP expires in 10 minutes. Please do not share it with anyone.</p>
          <p style="color: #555; font-size: 14px; text-align: center;">&copy; 2025 Ahmad Raza Khan. All rights reserved</p>
        </div>
      `,
    });
    console.log(`OTP sent to ${email}: ${otp}`);
  } catch (error) {
    console.error(`Failed to send OTP to ${email}:`, error);
    throw new Error("Failed to send OTP");
  }
};

// Clean up expired OTPs and pending registrations
const cleanupExpired = () => {
  const now = Date.now();
  for (const [email, data] of otps.entries()) {
    if (now > data.expires) {
      otps.delete(email);
      pendingRegistrations.delete(email);
      console.log(`🧹 Cleaned expired entry for ${email}`);
    }
  }
};

// --- Routes ---

// Temporary clear (⚠️ remove in production)
router.get("/clear-pending", (req, res) => {
  otps.clear();
  pendingRegistrations.clear();
  res.json({ message: "Pending registrations cleared" });
});

// STEP 1: Register admin (send OTP)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    cleanupExpired();

    // Check if username/email exists already
    const exists = await Admin.findOne({
      $or: [
        { username: { $regex: `^${username}$`, $options: "i" } },
        { email: { $regex: `^${email}$`, $options: "i" } },
      ],
    });
    if (exists) {
      return res.status(400).json({ message: "Username or email already exists" });
    }

    // Store hashed password temporarily + OTP
    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    otps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });
    pendingRegistrations.set(email, { username, email, password: hashed });

    await sendOTP(email, otp);
    res.status(201).json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
});

// STEP 2: Verify OTP & save admin
router.post("/verify-register", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otps.get(email);
    const pending = pendingRegistrations.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    if (!pending) {
      return res.status(400).json({ message: "No pending registration found" });
    }

    const admin = new Admin({
      username: pending.username,
      email: pending.email,
      password: pending.password,
    });
    await admin.save();

    otps.delete(email);
    pendingRegistrations.delete(email);

    res.json({ message: "Registration successful" });
  } catch (err) {
    console.error("Verify register error:", err);
    res.status(500).json({ message: err.message });
  }
});

// STEP 3: Login (password + send OTP)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: { $regex: `^${email}$`, $options: "i" } });

    if (!admin) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const otp = generateOTP();
    otps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    await sendOTP(email, otp);
    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// STEP 4: Verify OTP for login & issue JWT
router.post("/verify-login", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const stored = otps.get(email);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const admin = await Admin.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    otps.delete(email);
    res.json({ token });
  } catch (err) {
    console.error("Verify login error:", err);
    res.status(500).json({ message: err.message });
  }
});

// STEP 5: Forgot Password (send OTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email: { $regex: `^${email}$`, $options: "i" } });

    if (!admin) return res.status(404).json({ message: "Email not found" });

    const otp = generateOTP();
    otps.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    await sendOTP(email, otp);
    res.json({ message: "OTP sent to email", email });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: err.message });
  }
});

// STEP 6: Verify OTP & Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = otps.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const admin = await Admin.findOne({ email: { $regex: `^${email}$`, $options: "i" } });
    if (!admin) return res.status(404).json({ message: "Email not found" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    otps.delete(email);
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;