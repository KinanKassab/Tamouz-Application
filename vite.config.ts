import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.pexels\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pexels-images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'كشافة تموز - تطبيق الفوج الأول',
        short_name: 'كشافة تموز',
        description: 'تطبيق شامل لإدارة أنشطة الكشافة والتواصل مع أعضاء الفوج',
        theme_color: '#00796b',
        background_color: '#fafafa',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        icons: [
          {
            src: 'images/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'images/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'تسجيل الحضور',
            short_name: 'حضور',
            description: 'تسجيل الحضور السريع',
            url: '/?action=attendance',
            icons: [{ src: 'images/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'الأنشطة',
            short_name: 'أنشطة',
            description: 'عرض جدول الأنشطة',
            url: '/?page=activities',
            icons: [{ src: 'images/icon-192.png', sizes: '192x192' }]
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['lucide'],
        },
      },
    },
  },
});