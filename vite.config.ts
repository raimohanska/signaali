import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const exampleName = process.env.EXAMPLE || "first";

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, `examples/${exampleName}`),
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      signaali: resolve(__dirname, "./dist/esm/index.js"),
    },
  },
});

