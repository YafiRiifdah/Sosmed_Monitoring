import type { Request, Response } from "express";
import { z } from "zod";
import { postService } from "../services/postService.js";

const trackPostSchema = z.object({
  targetAccountId: z.string().uuid(),
  postUrl: z.string().url()
});

export const postController = {
  track: async (req: Request, res: Response) => {
    const data = trackPostSchema.parse(req.body);
    res.status(201).json(await postService.trackPost(data));
  }
};
