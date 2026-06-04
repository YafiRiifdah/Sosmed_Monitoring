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

// 4. POST /api/auth/forgot-password (Minta Token Reset)
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email wajib diisi." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    });

    if (!user) {
      res.status(400).json({ message: "Email atau Username tidak terdaftar." });
      return;
    }

    // Generate 6-digit numeric token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 Menit

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: tokenExpiry
      }
    });

    console.log(`[AUTH] DEV RESET TOKEN FOR ${user.email}: ${token}`);

    res.json({
      message: "Token reset berhasil dikirim. Silakan periksa kotak masuk Anda.",
      devToken: token // Dikembalikan langsung untuk mempermudah testing
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal meminta token reset password." });
  }
});

// 5. POST /api/auth/reset-password (Gunakan Token Reset)
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      res.status(400).json({ message: "Email, token, dan password baru wajib diisi." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "Password baru minimal harus memiliki 6 karakter." });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      }
    });

    if (!user || user.resetToken !== token) {
      res.status(400).json({ message: "Token reset atau email tidak valid." });
      return;
    }

    // Periksa kedaluwarsa token
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      res.status(400).json({ message: "Token reset sudah kedaluwarsa." });
      return;
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: "Kata sandi Anda berhasil diperbarui. Silakan login kembali." });
  } catch (error) {
    res.status(500).json({ message: "Gagal mereset kata sandi." });
  }
});

// 6. POST /api/auth/change-password (Ganti Password - Sesi Aktif)
authRouter.post("/change-password", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Sesi tidak valid." });
      return;
    }

    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: "Kata sandi lama dan kata sandi baru wajib diisi." });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: "Kata sandi baru minimal harus memiliki 6 karakter." });
      return;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!dbUser) {
      res.status(404).json({ message: "Pengguna tidak ditemukan." });
      return;
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, dbUser.password);
    if (!isPasswordValid) {
      res.status(400).json({ message: "Kata sandi lama salah." });
      return;
    }

    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: "Kata sandi Anda berhasil diperbarui." });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengubah kata sandi." });
  }
});

// 7. PUT /api/auth/profile (Update Detail Profil)
authRouter.put("/profile", authenticateUser, async (req: AuthenticatedRequest, res) => {
  try {
    const { username, email } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Sesi tidak valid." });
      return;
    }

    if (!username || !email) {
      res.status(400).json({ message: "Username dan email wajib diisi." });
      return;
    }

    // Periksa keunikan email/username baru
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ],
        NOT: {
          id: req.user.id
        }
      }
    });

    if (existingUser) {
      res.status(400).json({ message: "Username atau Email sudah digunakan oleh pengguna lain." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        username,
        email
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui profil pengguna." });
  }
});

