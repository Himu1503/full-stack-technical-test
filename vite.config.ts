import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': {
      VITE_API_BASE_URL: JSON.stringify(process.env.VITE_API_BASE_URL || ''),
      VITE_API_KEY: JSON.stringify(process.env.VITE_API_KEY || ''),
      VITE_EMAILJS_SERVICE_ID: JSON.stringify(process.env.VITE_EMAILJS_SERVICE_ID || ''),
      VITE_EMAILJS_TEMPLATE_ID: JSON.stringify(process.env.VITE_EMAILJS_TEMPLATE_ID || ''),
      VITE_EMAILJS_PUBLIC_KEY: JSON.stringify(process.env.VITE_EMAILJS_PUBLIC_KEY || ''),
    },
  },
});

