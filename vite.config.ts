import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "demise-factual-headsman.ngrok-free.dev",
      ".ngrok-free.dev",
      "localhost",
    ],
  },
});

