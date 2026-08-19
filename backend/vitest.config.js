import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    coverage: {
      exclude: ["src/generated/**", "src/**/main.js"],
      provider: "v8",
      reporter: ["text", "html"],
    },
    environment: "node",
    include: ["tests/**/*.test.js"],
    restoreMocks: true,
  },
});
