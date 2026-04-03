import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Altere "studyhub" para o nome real do seu repositório no GitHub
const REPO_NAME = "studyhub";

export default defineConfig({
  plugins: [react()],
  // Em produção (GitHub Pages), o app roda em /studyhub/
  base: process.env.NODE_ENV === "production" ? `/${REPO_NAME}/` : "/",
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      // Em dev, redireciona /api para o backend local
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
