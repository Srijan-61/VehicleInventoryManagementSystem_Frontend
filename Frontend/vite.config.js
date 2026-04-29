import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 1234,
    strictPort: true,
    proxy: {
      // ALL endpoints live on a single ASP.NET Core backend at https://localhost:7259
      // (confirmed from OpenAPI spec: Auth, Admin, AdminParts, Customer, Sales all on 7259)
      // Vite proxies every /api/* request through Node, so the browser never
      // hits CORS or the self-signed certificate directly.
      '/api': {
        target: 'https://localhost:7259',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
