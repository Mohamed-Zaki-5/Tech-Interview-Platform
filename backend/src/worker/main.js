import "dotenv/config";

import { createWorkerLifecycle } from "./create-worker-lifecycle.js";
import { runProcess } from "../platform/lifecycle/run-process.js";

await runProcess(({ database, logger }) => createWorkerLifecycle({ database, logger }));
