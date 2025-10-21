import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env": {},
  },
  build: {
    lib: {
      entry: "./src/main.jsx",
      name: "ChatWidget",
      fileName: () => "chat-widget.js",
      formats: ["iife"], // build dạng IIFE để nhúng
    },
    cssCodeSplit: false, // ⚡ ép gộp CSS vào JS
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        // ⚡ Đặt assetFileNames về thư mục gốc luôn
        assetFileNames: (assetInfo) => {
          // Chặn tạo thư mục assets/
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "chat-widget.css"; // nếu muốn vẫn có file riêng
          }
          return "[name].[ext]";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
  },
});
