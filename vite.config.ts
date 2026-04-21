import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Custom domain (brad.cooley.dev) → root base.
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "es2020",
  },
});
