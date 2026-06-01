import { Router } from "express";
import bcryptjs from "bcryptjs";
import { prisma } from "../database/prisma.js";
import { authenticateUser, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";
import { UserRole } from "@prisma/client";

export const adminRouter = Router();

// Protect all routes under this router: Must be authenticated and must be SUPER_ADMIN
adminRouter.use(authenticateUser);
adminRouter.use(requireRole(UserRole.SUPER_ADMIN));

// 1. GET /api/admin/users
adminRouter.get("/users", async (req: AuthenticatedRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: "asc" }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil daftar pengguna admin." });
  }
});

// 2. POST /api/admin/users (Create a new ADMIN)
adminRouter.post("/users", async (req: AuthenticatedRequest, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Semua kolom (username, email, password) wajib diisi." });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Password minimal harus memiliki 6 karakter." });
      return;
    }

    // Check if email or username is already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ message: "Username atau Email sudah terdaftar di sistem." });
      return;
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat akun admin baru." });
  }
});

// 3. DELETE /api/admin/users/:id
adminRouter.delete("/users/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const id = req.params.id as string;

    if (!req.user) {
      res.status(401).json({ message: "Sesi tidak valid." });
      return;
    }

    // Prevent Super Admin from deleting themselves
    if (req.user.id === id) {
      res.status(400).json({ message: "Anda tidak dapat menghapus akun Super Admin Anda sendiri!" });
      return;
    }

    // Verify user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id }
    });

    if (!userToDelete) {
      res.status(404).json({ message: "Pengguna tidak ditemukan." });
      return;
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: `Akun admin ${userToDelete.username} berhasil dihapus.` });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus akun admin." });
  }
});
