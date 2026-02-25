import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively by browsers
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          // UI / animation libs
          'vendor-ui': ['framer-motion', 'lucide-react'],
          // Stripe — large, rarely changes
          'vendor-stripe': ['@stripe/stripe-js'],
        },
      },
    },
  },
})
