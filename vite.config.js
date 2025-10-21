import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {}, // tránh lỗi "process is not defined"
  },
  build: {
    lib: {
      entry: "./src/main.jsx",
      name: "ChatWidget",
      fileName: () => "chat-widget.js",
      formats: ["iife"], // build dạng IIFE để nhúng
    },
    cssCodeSplit: false, 
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: "[name].[ext]", // không tạo thư mục assets/
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
