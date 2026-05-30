import { Router } from "express";
import { monitoredAccountController, targetAccountController } from "../controllers/accountControllers.js";
import { dashboardController } from "../controllers/dashboardController.js";
import { jobController } from "../controllers/jobController.js";
import { postController } from "../controllers/postController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const apiRouter = Router();

apiRouter.get("/overview", asyncHandler(dashboardController.overview));
apiRouter.get("/ranking", asyncHandler(dashboardController.ranking));

apiRouter.get("/monitored-accounts", asyncHandler(monitoredAccountController.list));
apiRouter.post("/monitored-accounts", asyncHandler(monitoredAccountController.create));
apiRouter.put("/monitored-accounts/:id", asyncHandler(monitoredAccountController.update));
apiRouter.delete("/monitored-accounts/:id", asyncHandler(monitoredAccountController.remove));

apiRouter.get("/target-accounts", asyncHandler(targetAccountController.list));
apiRouter.post("/target-accounts", asyncHandler(targetAccountController.create));
apiRouter.put("/target-accounts/:id", asyncHandler(targetAccountController.update));
apiRouter.delete("/target-accounts/:id", asyncHandler(targetAccountController.remove));

apiRouter.get("/posts", asyncHandler(dashboardController.posts));
apiRouter.post("/posts/track", asyncHandler(postController.track));
apiRouter.get("/posts/:id/status", asyncHandler(dashboardController.postStatus));

apiRouter.post("/jobs/discover-posts", asyncHandler(jobController.discoverPosts));
apiRouter.post("/jobs/fetch-engagements", asyncHandler(jobController.fetchEngagements));
apiRouter.post("/jobs/recalculate-score", asyncHandler(jobController.recalculateScore));
