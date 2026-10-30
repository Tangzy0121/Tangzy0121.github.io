import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Builds into ./dist; scripts/deploy-local.ts then copies dist into the
// GitHub Pages root (the parent directory of this source tree).
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true, assetsInlineLimit: 0 },
});
