import { defineConfig } from 'vite';
import { optimizeImages } from './scripts/optimize-images.mjs';

export default defineConfig(async ({ command }) => {
  const images = command === 'build' ? await optimizeImages() : null;
  return {
    base: '/',
    define: { __OPTIMIZED_IMAGES__: JSON.stringify(images?.mapping || {}) },
    plugins: images ? [{ name: 'lossless-public-images', closeBundle: images.writeOutput }] : [],
  };
});
