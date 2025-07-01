import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5172,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*'],
      manifest: {
        name: "UMI Platform",
        short_name: "UMI",
        start_url: "/",
        display: "standalone",
        background_color: '#030014',
        theme_color: '#030014',
      }
    })
  ],
})
