import { Router } from "express";
import { monitoredAccountController, targetAccountController } from "../controllers/accountControllers.js";
import { dashboardController } from "../controllers/dashboardController.js";
import { jobController } from "../controllers/jobController.js";
import { postController } from "../controllers/postController.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authRouter } from "./authRouter.js";
import { adminRouter } from "./adminRouter.js";
import { authenticateUser } from "../middleware/auth.js";
import { registerNewApiKey, activateApiKey, verifyAndSaveApiKey } from "../utils/apiUsage.js";

export const apiRouter = Router();

// Public / Session auth routes
apiRouter.use("/auth", authRouter);

// Apply global authentication block to all data routes below
apiRouter.use(authenticateUser);

// Admin-only management endpoints
apiRouter.use("/admin", adminRouter);

// Accounts & API Keys management (accessible by Admin & Super Admin)
apiRouter.post(
  "/accounts/api-keys",
  asyncHandler(async (req, res) => {
    const { provider, accountName, email, apiKey, notes } = req.body;
    if (!provider || !accountName || !email || !apiKey) {
      res.status(400).json({ message: "Semua kolom wajib diisi." });
      return;
    }
    if (provider !== "rapidapi" && provider !== "apify") {
      res.status(400).json({ message: "Provider harus berupa 'rapidapi' atau 'apify'." });
      return;
    }
    const result = await registerNewApiKey(provider, accountName, email, apiKey, notes);
    res.json({ message: "API KEY berhasil disimpan secara aman!", account: result });
  })
);

apiRouter.post(
  "/accounts/api-keys/activate",
  asyncHandler(async (req, res) => {
    const { provider, apiKeyMasked } = req.body;
    if (!provider || !apiKeyMasked) {
      res.status(400).json({ message: "Provider dan apiKeyMasked wajib diisi." });
      return;
    }
    if (provider !== "rapidapi" && provider !== "apify") {
      res.status(400).json({ message: "Provider harus berupa 'rapidapi' atau 'apify'." });
      return;
    }
    const result = await activateApiKey(provider, apiKeyMasked);
    res.json({ message: "API KEY berhasil diaktifkan secara manual!", account: result });
  })
);

apiRouter.post(
  "/accounts/api-keys/verify",
  asyncHandler(async (req, res) => {
    const { provider, apiKeyMasked } = req.body;
    if (!provider || !apiKeyMasked) {
      res.status(400).json({ message: "Provider dan apiKeyMasked wajib diisi." });
      return;
    }
    if (provider !== "rapidapi" && provider !== "apify") {
      res.status(400).json({ message: "Provider harus berupa 'rapidapi' atau 'apify'." });
      return;
    }
    const result = await verifyAndSaveApiKey(provider, apiKeyMasked);
    if (result.success) {
      res.json({ message: "API KEY berhasil diverifikasi dan aktif!", result });
    } else {
      res.status(400).json({ message: result.message || "Verifikasi API KEY gagal." });
    }
  })
);

apiRouter.get("/overview", asyncHandler(dashboardController.overview));
apiRouter.get("/ranking", asyncHandler(dashboardController.ranking));

apiRouter.get("/monitored-accounts", asyncHandler(monitoredAccountController.list));
apiRouter.post("/monitored-accounts", asyncHandler(monitoredAccountController.create));
apiRouter.post("/monitored-accounts/bulk", asyncHandler(monitoredAccountController.bulk));
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
apiRouter.get("/jobs/:id", asyncHandler(jobController.getJob));
