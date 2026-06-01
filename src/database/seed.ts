import bcryptjs from "bcryptjs";
import { prisma } from "./prisma.js";
import { logger } from "../utils/logger.js";
import { UserRole } from "@prisma/client";

export async function seedSuperAdmin() {
  try {
    // 1. Check if SUPER_ADMIN already exists
    const superAdmin = await prisma.user.findFirst({
      where: { role: UserRole.SUPER_ADMIN }
    });

    if (superAdmin) {
      logger.info("Database Seed: Super Admin account already exists.");
      return;
    }

    // 2. Hash the default password
    const hashedPassword = await bcryptjs.hash("12345678", 10);

    // 3. Create the Super Admin account
    await prisma.user.create({
      data: {
        email: "yafilala2@gmail.com",
        username: "YAPP",
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN
      }
    });

    logger.info("Database Seed: Super Admin account successfully created.");
  } catch (error) {
    logger.error(`Database Seed: Error seeding Super Admin: ${error instanceof Error ? error.message : String(error)}`);
  }
}
