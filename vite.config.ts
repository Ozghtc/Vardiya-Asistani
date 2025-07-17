import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production optimized config
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://hzmbackandveritabani-production-c660.up.railway.app'),
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
