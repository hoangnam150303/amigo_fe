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
      entry: "./src/main.jsx",
      name: "ChatWidget",
      fileName: () => "chat-widget.js", // ✅ ép xuất ra 1 file duy nhất ở root
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        dir: "dist", // ✅ tất cả nằm ở dist
        inlineDynamicImports: true,
        assetFileNames: "[name].[ext]", // ✅ không tạo thư mục assets/
      },
    },
  },
});
