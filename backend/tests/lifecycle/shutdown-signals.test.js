import { EventEmitter } from "node:events";

import { describe, expect, it, vi } from "vitest";

import { registerShutdownSignals } from "../../src/platform/lifecycle/register-shutdown-signals.js";

describe("shutdown signals", () => {
  it("runs graceful shutdown once when termination signals race", async () => {
    const processTarget = new EventEmitter();
    const stopped = Promise.withResolvers();
    const lifecycle = {
      stop: vi.fn().mockImplementation(async (signal) => {
        stopped.resolve(signal);
      }),
    };
    const logger = { error: vi.fn() };

    const unregister = registerShutdownSignals({ lifecycle, logger, processTarget });
    processTarget.emit("SIGTERM");
    processTarget.emit("SIGINT");

    await expect(stopped.promise).resolves.toBe("SIGTERM");
    expect(lifecycle.stop).toHaveBeenCalledOnce();
    unregister();
  });
});
