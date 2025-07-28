import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Production optimized config
export default defineConfig({
  plugins: [react()],
  define: {
    // Remove hardcoded API key - now using environment variables
    // 'import.meta.env.VITE_API_KEY': JSON.stringify('hzm_1ce98c92189d4a109cd604b22bfd86b7'),
  },
  server: {
    port: 3000,
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
