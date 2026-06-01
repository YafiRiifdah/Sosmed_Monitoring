import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { prisma } from "../database/prisma.js";
import { UserRole } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: UserRole;
  };
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // 1. Get token from cookies or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "Sesi Anda telah berakhir, silakan login kembali." });
      return;
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    // 3. Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    if (!user) {
      res.status(401).json({ message: "Pengguna tidak ditemukan." });
      return;
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token tidak valid atau kedaluwarsa." });
  }
}

export function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Belum terautentikasi." });
      return;
    }

    if (req.user.role !== role && req.user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ message: "Anda tidak memiliki izin untuk mengakses menu ini." });
      return;
    }

    next();
  };
}
