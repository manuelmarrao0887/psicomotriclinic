import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Separar dependências pesadas em chunks próprios para
        // melhor caching e initial load mais leve.
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
        },
      },
    },
  },
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
});
