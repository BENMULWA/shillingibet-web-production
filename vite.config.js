
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    allowedHosts: true, // This will stop the 403 Forbidden error
    proxy: {
      "/api": {
        target: "https://cryptoapis.shilingibet.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },


  esbuild: {
    drop: ["console", "debugger"],
  },

  build: {
    // Enable minification
    minify: "esbuild",
    // Code splitting configuration
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
          "ui-vendor": ["framer-motion", "react-hot-toast"],
          // Antd is huge - isolate it
          antd: ["antd"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable source maps for debugging (disable in prod if needed)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: "es2020",
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
  },
});
