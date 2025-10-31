#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const exampleName = process.argv[2];

if (!exampleName) {
  console.error("Usage: npm run example:dev <example-name>");
  console.error("Example: npm run example:dev first");
  process.exit(1);
}

const examplePath = join(__dirname, "..", "examples", exampleName);

if (!existsSync(examplePath)) {
  console.error(`Example "${exampleName}" not found in examples/ directory`);
  process.exit(1);
}

const viteProcess = spawn("vite", [], {
  stdio: "inherit",
  env: {
    ...process.env,
    EXAMPLE: exampleName,
  },
  shell: true,
});

viteProcess.on("error", (err) => {
  console.error("Failed to start vite:", err);
  process.exit(1);
});

viteProcess.on("exit", (code) => {
  process.exit(code || 0);
});

