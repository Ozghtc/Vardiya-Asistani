import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://rare-courage-production.up.railway.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://rare-courage-production.up.railway.app'),
    'import.meta.env.VITE_API_KEY': JSON.stringify('hzm_1ce98c92189d4a109cd604b22bfd86b7'),
    'import.meta.env.VITE_PROJECT_ID': JSON.stringify('5'),
    'import.meta.env.VITE_TABLE_ID': JSON.stringify('10'),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
});
