import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.png', 'manifest-icon-192.png', 'manifest-icon-512.png', 'screenshot/*.png'],
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/unpkg\.com\/leaflet.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leaflet-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Voz Urbana - Reportes Ciudadanos',
        short_name: 'Voz Urbana',
        description: 'Aplicación de reportes urbanos para ciudadanos',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          {
            src: '/icon.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/manifest-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/manifest-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot/screenshot1.png',
            sizes: '1896x971',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Vista principal de Voz Urbana'
          },
          {
            src: '/screenshot/screenshot2.png',
            sizes: '396x860',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Vista móvil de reportes'
          }
        ]
      }
    })
  ]
})
