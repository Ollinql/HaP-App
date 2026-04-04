import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/HaP-App/',
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifest: false,
      includeAssets: ['**/*'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpeg,svg,woff2}'],
        navigateFallback: '/HaP-App/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
    }),
  ],
})
