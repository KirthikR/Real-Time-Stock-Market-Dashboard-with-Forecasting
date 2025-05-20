import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { splitVendorChunkPlugin } from 'vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),
  ],
  resolve: {
    alias: {
      // Add path aliases for easier imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
    exclude: [],
    esbuildOptions: {
      // Enable JSX in TS files
      loader: {
        '.ts': 'tsx',
        '.tsx': 'tsx',
      },
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large dependencies into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
      },
    },
    // Enable source map for better debugging
    sourcemap: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    // Add HMR with better error overlay
    hmr: {
      overlay: true,
    },
    // Force clear cache on reload
    watch: {
      usePolling: true,
    },
  },
  // Better handling of references to deleted files
  cacheDir: 'node_modules/.vite_fresh',
});
