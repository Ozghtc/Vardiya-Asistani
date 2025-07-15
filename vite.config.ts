import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    proxy: {
      '/.netlify/functions': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://hzmbackandveritabani-production-c660.up.railway.app',
        changeOrigin: true,
        secure: true,
        headers: {
          'X-API-Key': 'hzm_b446ef9e20064af09190e85f415a2a0c'
        }
      }
    }
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://hzmbackandveritabani-production-c660.up.railway.app'),
            'import.meta.env.VITE_API_KEY': JSON.stringify('hzm_b446ef9e20064af09190e85f415a2a0c'),
    'import.meta.env.VITE_PROJECT_ID': JSON.stringify('5'),
    'import.meta.env.VITE_TABLE_ID': JSON.stringify('10'),
    'import.meta.env.VITE_NETLIFY_FUNCTIONS_URL': JSON.stringify('/.netlify/functions'),
    'import.meta.env.VITE_SITE_URL': JSON.stringify('https://vardiyaasistani.netlify.app')
  }
});
