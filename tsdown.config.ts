export default [
  {
    entry: ["src/signal/index.ts"],
    format: "esm",
    dts: false,
    clean: true,
    outDir: "dist/esm",
    splitting: false,
    sourcemap: false,
  }
];

