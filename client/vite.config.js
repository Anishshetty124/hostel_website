import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-router-dom', 'axios'],
          'lucide': ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-router-dom', 'axios', 'lucide-react'],
  },
  // Netlify/SPA fallback for client-side routing
  preview: {
    // This ensures 404s fallback to index.html for SPA
    fallback: true,
  },
});
