import { Router } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prisma.js";
import { authenticateUser, type AuthenticatedRequest } from "../middleware/auth.js";

export const authRouter = Router();

// 1. POST /api/auth/login
authRouter.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ message: "Email/Username dan password wajib diisi." });
      return;
    }

    // Find user by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });

    if (!user) {
      res.status(400).json({ message: "Kredensial tidak valid (User tidak ditemukan)." });
      return;
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Kredensial tidak valid (Kata sandi salah)." });
      return;
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, { expiresIn: "30d" });

    // Set secure HTTP-Only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan internal pada server saat login." });
  }
});

// 2. POST /api/auth/logout
authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax"
  });
  res.json({ message: "Berhasil keluar sesi secara aman." });
});

// 3. GET /api/auth/me
authRouter.get("/me", authenticateUser, (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ message: "Sesi tidak valid." });
    return;
  }
  res.json(req.user);
});
