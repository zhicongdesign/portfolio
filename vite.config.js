import { defineConfig } from 'vite';

export default defineConfig(async ({ command }) => {
  const images = command === 'build' && process.env.SKIP_IMAGE_OPTIMIZATION !== '1'
    ? await import('./scripts/optimize-images.mjs').then(({ optimizeImages }) => optimizeImages())
    : null;
  return {
    base: '/',
    publicDir: command === 'build' ? false : 'public',
    define: { __OPTIMIZED_IMAGES__: JSON.stringify(images?.mapping || {}) },
    plugins: [
      {
        name: 'hero-boot-assets',
        transformIndexHtml(html) {
          const mapping = images?.mapping || {};
          return html
            .replaceAll('__HERO_BACKDROP__', mapping['/assets/figma-home-v2/hero-fallback.png'] || '/assets/figma-home-v2/hero-fallback.png')
            .replaceAll('__HERO_DESKTOP_MODEL__', mapping['/assets/3d/hero-pang-desktop.glb'] || '/assets/3d/hero-pang-desktop.glb')
            .replaceAll('__HERO_MOBILE_MODEL__', mapping['/assets/3d/hero-pang-mobile.glb'] || '/assets/3d/hero-pang-mobile.glb');
        },
      },
      ...(images ? [{ name: 'optimized-public-images', closeBundle: images.writeOutput }] : []),
    ],
  };
});
