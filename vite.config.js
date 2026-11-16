import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
export default defineConfig({
  plugins: [tailwindcss()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'ui') } },
  build: {
    outDir: 'ui-dist',
    emptyOutDir: true,
    rollupOptions: { onwarn(warning, warn) { if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return; warn(warning); } },
    lib: { entry: 'ui/main.jsx', name: 'RiseUIBundle', formats: ['iife'], fileName: () => 'rise-ui.js', cssFileName: 'rise-ui' },
  },
});
