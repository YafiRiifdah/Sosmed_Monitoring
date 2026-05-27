import { Router } from "express";
import { monitoredAccountController, targetAccountController } from "../controllers/accountControllers.js";
import { dashboardController } from "../controllers/dashboardController.js";
import { jobController } from "../controllers/jobController.js";

export const apiRouter = Router();

apiRouter.get("/overview", dashboardController.overview);
apiRouter.get("/ranking", dashboardController.ranking);

apiRouter.get("/monitored-accounts", monitoredAccountController.list);
apiRouter.post("/monitored-accounts", monitoredAccountController.create);
apiRouter.put("/monitored-accounts/:id", monitoredAccountController.update);
apiRouter.delete("/monitored-accounts/:id", monitoredAccountController.remove);

apiRouter.get("/target-accounts", targetAccountController.list);
apiRouter.post("/target-accounts", targetAccountController.create);
apiRouter.put("/target-accounts/:id", targetAccountController.update);
apiRouter.delete("/target-accounts/:id", targetAccountController.remove);

apiRouter.get("/posts", dashboardController.posts);
apiRouter.get("/posts/:id/status", dashboardController.postStatus);

apiRouter.post("/jobs/discover-posts", jobController.discoverPosts);
apiRouter.post("/jobs/fetch-engagements", jobController.fetchEngagements);
apiRouter.post("/jobs/recalculate-score", jobController.recalculateScore);
