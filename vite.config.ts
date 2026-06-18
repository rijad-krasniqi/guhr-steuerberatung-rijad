import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Minimal Vite setup: React plugin + a fixed dev port so the single
// `npm run dev` command always lands on the same URL.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
});
