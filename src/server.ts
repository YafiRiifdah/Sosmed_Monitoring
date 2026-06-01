import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { seedSuperAdmin } from "./database/seed.js";

app.listen(env.PORT, async () => {
  await seedSuperAdmin();
  logger.info(`API listening on port ${env.PORT}`);
});
