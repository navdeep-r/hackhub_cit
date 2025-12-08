import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Enable HTML5 History API fallback for SPA routing
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost"
      }
    }
  },
  // Ensure production builds work correctly with SPA routing
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});