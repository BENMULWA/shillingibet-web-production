
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { imageToWebpPlugin } from "vite-plugin-image-to-webp";

const packageChunkMap = [
  ["antd", "antd"],
  ["@ant-design", "antd"],
  ["rc-", "antd"],
  ["@rc-component", "antd"],
  ["dayjs", "antd"],
  ["react-dom", "react-core"],
  ["react-router-dom", "react-core"],
  ["react/", "react-core"],
  ["scheduler", "react-core"],
  ["@tanstack/react-query", "query-vendor"],
  ["react-hot-toast", "ui-vendor"],
  ["framer-motion", "ui-vendor"],
  ["socket.io-client", "chat-vendor"],
  ["engine.io-client", "chat-vendor"],
  ["socket.io-parser", "chat-vendor"],
  ["moment", "date-vendor"],
  ["lodash", "utils-vendor"],
  ["react-icons", "icons-vendor"],
  ["lucide-react", "icons-vendor"],
  ["iconsax-react", "icons-vendor"],
  ["@heroicons", "icons-vendor"],
  ["@headlessui/react", "ui-primitives"],
  ["react-hook-form", "form-vendor"],
  ["react-turnstile", "security-vendor"],
];

const getVendorChunkName = (id) => {
  if (!id.includes("node_modules")) return null;

  for (const [pkg, chunkName] of packageChunkMap) {
    if (id.includes(pkg)) return chunkName;
  }

  return undefined;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET || "https://cryptoapis.shilingibet.com";
  const apiProxyHost = new URL(apiProxyTarget).hostname;

  return {
  plugins: [
    react(),
    tailwindcss(),
    imageToWebpPlugin({
      imageFormats: ["jpg", "jpeg", "png"],
      webpQuality: {
        quality: 80,
      },
    }),
  ],

  server: {
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      apiProxyHost,
    ],
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
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
        manualChunks(id) {
          return getVendorChunkName(id);
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
  };
});
