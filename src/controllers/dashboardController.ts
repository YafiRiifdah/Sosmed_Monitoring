import type { Request, Response } from "express";
import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {
  overview: async (_req: Request, res: Response) => {
    res.json(await dashboardService.getOverview());
  },
  posts: async (_req: Request, res: Response) => {
    res.json(await dashboardService.listPosts());
  },
  postStatus: async (req: Request, res: Response) => {
    res.json(await dashboardService.getPostStatus(String(req.params.id)));
  },
  ranking: async (_req: Request, res: Response) => {
    res.json(await dashboardService.getRanking());
  }
};
