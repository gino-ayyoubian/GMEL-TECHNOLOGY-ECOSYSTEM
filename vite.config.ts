import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './components'),
        '@services': path.resolve(__dirname, './services'),
        '@utils': path.resolve(__dirname, './utils'),
        '@contexts': path.resolve(__dirname, './contexts'),
        '@hooks': path.resolve(__dirname, './hooks'),
      },
    },
    
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    
    build: {
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['recharts', 'lucide-react'],
            i18n: ['react-i18next', 'i18next'],
            gemini: ['@google/generative-ai'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: mode !== 'production',
    },
    
    optimizeDeps: {
      include: ['react', 'react-dom', '@google/generative-ai'],
      exclude: ['@vite/client', '@vite/env'],
    },
    
    server: {
      port: 5173,
      strictPort: true,
      host: '0.0.0.0',
      hmr: {
        overlay: true,
      },
    },
    
    preview: {
      port: 4173,
      strictPort: true,
      host: '0.0.0.0',
    },
  };
});
