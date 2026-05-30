import type { Request, Response } from "express";
import { z } from "zod";
import { jobService } from "../services/jobService.js";

const optionalTargetSchema = z.object({ targetAccountId: z.string().uuid().optional() });
const optionalPostSchema = z.object({ postId: z.string().uuid().optional() });

export const jobController = {
  discoverPosts: async (req: Request, res: Response) => {
    const data = optionalTargetSchema.parse(req.body ?? {});
    res.status(202).json(await jobService.enqueuePostDiscovery(data.targetAccountId));
  },
  fetchEngagements: async (req: Request, res: Response) => {
    const data = optionalPostSchema.parse(req.body ?? {});
    res.status(202).json(await jobService.enqueueEngagementFetch(data.postId));
  },
  recalculateScore: async (req: Request, res: Response) => {
    const data = optionalPostSchema.parse(req.body ?? {});
    res.status(202).json(await jobService.enqueueScoring(data.postId));
  },
  getJob: async (req: Request, res: Response) => {
    res.json(await jobService.getJob(String(req.params.id)));
  }
};
