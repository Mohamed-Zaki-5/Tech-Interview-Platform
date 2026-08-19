import { Router } from "express";

/**
 * Establishes the versioned composition point. Domain modules register their routers here in
 * later phases; Phase 1 intentionally exposes no domain endpoints.
 *
 * @param {import("express").Express} application
 */
export function registerModuleRoutes(application) {
  application.use("/api/v1", Router());
}
