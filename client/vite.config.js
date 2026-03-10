import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2018',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively by browsers
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // Animation — split from icons so non-animated pages skip it
          'vendor-motion': ['framer-motion'],
          // Icons
          'vendor-icons': ['lucide-react'],
          // Stripe — large, rarely changes
          'vendor-stripe': ['@stripe/stripe-js'],
        },
      },
    },
  },
})
