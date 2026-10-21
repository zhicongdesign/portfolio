import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(process.cwd());
const sourceRoot = join(root, 'public');
const outputRoot = join(root, 'dist');
const cacheRoot = join(root, '.image-cache');

async function imageFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await imageFiles(path));
    else if (/\.(png|jpe?g)$/i.test(entry.name)) files.push(path);
  }
  return files;
}

export async function optimizeImages() {
  const files = [];
  for (const folder of ['figma-frames', 'figma-home-v2', 'portfolio-keynote', 'huawei-keynote']) {
    files.push(...await imageFiles(join(sourceRoot, 'assets', folder)));
  }
  await mkdir(cacheRoot, { recursive: true });
  const results = [];
  let next = 0;
  // Limit parallel encoders to keep memory use predictable on CI.
  await Promise.all(Array.from({ length: 2 }, async () => {
    while (next < files.length) {
      const source = files[next++];
      const path = relative(sourceRoot, source).split('\\').join('/');
      const input = await readFile(source);
      const lossless = /\/figma-home-v2\/(hero-fallback|logo-[^/]+)\.png$/i.test(path);
      const digest = createHash('sha256').update('webp-q93-v1:')
        .update(lossless ? 'lossless:' : 'quality93:').update(input).digest('hex');
      const cached = join(cacheRoot, `${digest}.webp`);
      let encodedBytes;
      try {
        encodedBytes = (await stat(cached)).size;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        const encoded = await sharp(input).webp(lossless
          ? { lossless: true, effort: 4 }
          : { quality: 93, effort: 4, smartSubsample: true }).toBuffer();
        await writeFile(cached, encoded);
        encodedBytes = encoded.length;
      }
      const smaller = encodedBytes < input.length;
      results.push({
        path,
        outputPath: smaller ? path.replace(/\.(png|jpe?g)$/i, '.webp') : path,
        originalBytes: input.length,
        optimizedBytes: smaller ? encodedBytes : input.length,
        cached,
      });
      if (results.length % 20 === 0) console.log(`Optimized ${results.length}/${files.length} images.`);
    }
  }));

  results.sort((a, b) => a.path.localeCompare(b.path));
  const mapping = Object.fromEntries(results.filter(item => item.path !== item.outputPath)
    .map(item => [`/${item.path}`, `/${item.outputPath}`]));
  const models = [];
  for (const name of ['hero-pang-desktop', 'hero-pang-mobile']) {
    const path = `assets/3d/${name}.glb`;
    const digest = createHash('sha256').update(await readFile(join(sourceRoot, path)))
      .digest('hex').slice(0, 12);
    const outputPath = `assets/3d/${name}.${digest}.glb`;
    models.push({ path, outputPath });
    mapping[`/${path}`] = `/${outputPath}`;
  }
  const before = results.reduce((total, item) => total + item.originalBytes, 0);
  const after = results.reduce((total, item) => total + item.optimizedBytes, 0);
  console.log(`High-quality WebP: ${files.length} images, ${(before / 1048576).toFixed(1)} -> ${(after / 1048576).toFixed(1)} MiB (${((1 - after / before) * 100).toFixed(1)}% smaller).`);
  return {
    mapping,
    async writeOutput() {
      for (const item of results) {
        const output = join(outputRoot, item.outputPath);
        await mkdir(dirname(output), { recursive: true });
        await copyFile(item.path === item.outputPath ? join(sourceRoot, item.path) : item.cached, output);
      }
      for (const { path, outputPath } of models) {
        const output = join(outputRoot, outputPath);
        await mkdir(dirname(output), { recursive: true });
        await copyFile(join(sourceRoot, path), output);
      }
      // Vite's default public-directory copy also ships all large source PNGs,
      // unused design exports, and source 3D files. Only runtime assets belong
      // in the deployable output.
      for (const path of [
        'assets/figma-home-v2/logo-alibaba.svg',
        'assets/figma-home-v2/arrow.svg',
        'assets/figma-home-v2/hero-mask.svg',
        'assets/figma-home-v2/hero-wave.svg',
        'assets/figma-home-v2/contact-mask.svg',
        'assets/figma-home-v2/contact-wave.svg',
        'assets/figma-home/hero-texture.png',
        'assets/figma-frames/resume.png',
        'assets/contact-background.png',
        'assets/hero-pang-placeholder.png',
        'assets/hero-motion/hero-loop-1080p.mp4',
      ]) {
        const output = join(outputRoot, path);
        await mkdir(dirname(output), { recursive: true });
        await copyFile(join(sourceRoot, path), output);
      }
      const report = results.map(({ cached, ...item }) => item);
      await writeFile(join(outputRoot, 'image-optimization.json'), JSON.stringify(report, null, 2));
    },
  };
}
