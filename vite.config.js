import { defineConfig } from 'vite';

export default defineConfig(async ({ command }) => {
  const images = command === 'build' && process.env.SKIP_IMAGE_OPTIMIZATION !== '1'
    ? await import('./scripts/optimize-images.mjs').then(({ optimizeImages }) => optimizeImages())
    : null;
  return {
    base: '/',
    define: { __OPTIMIZED_IMAGES__: JSON.stringify(images?.mapping || {}) },
    plugins: images ? [{ name: 'lossless-public-images', closeBundle: images.writeOutput }] : [],
  };
});
