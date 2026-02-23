// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import preact from "@astrojs/preact";
import { VitePWA } from "vite-plugin-pwa";

// https://astro.build/config
export default defineConfig({
  output: "static",
  vite: {
    plugins: [
      tailwindcss(),
      VitePWA({
        strategies: "generateSW",
        filename: "sw.js",
        registerType: "autoUpdate",
        workbox: {
          runtimeCaching: [
            {
              urlPattern: ({ url }) => url.pathname.startsWith("/_astro/"),
              handler: "CacheFirst",
              options: {
                cacheName: "astro-assets-cache",
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 ano
                },
              },
            },
            // Cache para o HTML (resolve o problema do max-age=0)
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "html-cache",
              },
            },
          ],
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
            if (id.includes('CustomerDataForm') || id.includes('UserDataForm') || id.includes('SupplierDataForm') || id.includes('SelectSupplierModal')){
              return 'forms';
            }
            if (id.includes('/src/elements/UserCard') || id.includes('SideBar')){
              return 'sidebar';
            }
            if (id.includes("/src/elements") || id.includes("ListWrapper.tsx") || id.includes("/src/utils")) {
              return "extra";
            }
          },
        },
      },
    },
  },
  base: "/",
  trailingSlash: "ignore",

  root: "./",
  integrations: [
    preact({
      compat: true,
    }),
  ],
});
