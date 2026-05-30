import type { Request, Response } from "express";
import { z } from "zod";
import { accountService } from "../services/accountService.js";

const accountSchema = z.object({
  username: z.string().trim().min(1).transform((value) => value.replace(/^@/, "").toLowerCase()),
  displayName: z.string().trim().optional().nullable(),
  kontingen: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional()
});
const targetAccountSchema = accountSchema.omit({ kontingen: true });
const bulkMonitoredSchema = z.object({
  accounts: z.array(accountSchema).min(1).max(500)
});

export const monitoredAccountController = {
  list: async (_req: Request, res: Response) => res.json(await accountService.listMonitored()),
  create: async (req: Request, res: Response) => {
    const data = accountSchema.parse(req.body);
    res.status(201).json(await accountService.createMonitored(data));
  },
  bulk: async (req: Request, res: Response) => {
    const data = bulkMonitoredSchema.parse(req.body);
    res.status(201).json(await accountService.bulkUpsertMonitored(data.accounts));
  },
  update: async (req: Request, res: Response) => {
    const data = accountSchema.partial().parse(req.body);
    res.json(await accountService.updateMonitored(String(req.params.id), data));
  },
  remove: async (req: Request, res: Response) => {
    await accountService.removeMonitored(String(req.params.id));
    res.status(204).send();
  }
};

export const targetAccountController = {
  list: async (_req: Request, res: Response) => res.json(await accountService.listTargets()),
  create: async (req: Request, res: Response) => {
    const data = targetAccountSchema.parse(req.body);
    res.status(201).json(await accountService.createTarget(data));
  },
  update: async (req: Request, res: Response) => {
    const data = targetAccountSchema.partial().parse(req.body);
    res.json(await accountService.updateTarget(String(req.params.id), data));
  },
  remove: async (req: Request, res: Response) => {
    await accountService.removeTarget(String(req.params.id));
    res.status(204).send();
  }
};
