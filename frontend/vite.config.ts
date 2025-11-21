import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Backend server port (from backend/.env PORT=8080)
        changeOrigin: true,
        secure: false,
      }
    }
  }
});