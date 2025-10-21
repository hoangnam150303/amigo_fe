import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {}, // ✅ tránh lỗi "process is not defined"
  },
  build: {
    lib: {
      entry: "./src/main.jsx", // ✅ điểm vào chính
      name: "ChatWidget", // tên global để browser nhận diện
      fileName: "chat-widget", // xuất ra chat-widget.js
      formats: ["iife"], // ✅ định dạng nhúng browser trực tiếp
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true, // ✅ gộp toàn bộ import vào 1 file duy nhất
      },
    },
    outDir: "dist", // ✅ thư mục xuất build
    emptyOutDir: true, // xóa dist cũ trước khi build mới
  },
});
