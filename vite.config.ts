import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  // Three.js is already ESM; serving it directly avoids a redundant dev-only prebundle.
  optimizeDeps: { exclude: ["three"] },
  build: { target: "es2022" },
});
