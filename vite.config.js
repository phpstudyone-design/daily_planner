// vite.config.js - Configure Vite for React SPA build (Tauri Desktop)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  base: '/',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    // Proxy /api requests to Express backend (Tauri dev mode)
    proxy: {
      '/api': 'http://127.0.0.1:17321',
      '/health': 'http://127.0.0.1:17321',
    },
  },
});
