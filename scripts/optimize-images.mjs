import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(process.cwd());
const sourceRoot = join(root, 'public');
const outputRoot = join(root, 'dist');
const cacheRoot = join(root, '.image-cache');

async function pngFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await pngFiles(path));
    else if (/\.png$/i.test(entry.name)) files.push(path);
  }
  return files;
}

export async function optimizeImages() {
  const files = [];
  for (const folder of ['figma-frames', 'figma-home-v2']) {
    files.push(...await pngFiles(join(sourceRoot, 'assets', folder)));
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
      const digest = createHash('sha256').update(input).digest('hex');
      const cached = join(cacheRoot, `${digest}.webp`);
      let encodedBytes;
      try {
        encodedBytes = (await stat(cached)).size;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        const encoded = await sharp(input).webp({ lossless: true, effort: 6 }).toBuffer();
        await writeFile(cached, encoded);
        encodedBytes = encoded.length;
      }
      const smaller = encodedBytes < input.length;
      results.push({
        path,
        outputPath: smaller ? path.replace(/\.png$/i, '.webp') : path,
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
  const before = results.reduce((total, item) => total + item.originalBytes, 0);
  const after = results.reduce((total, item) => total + item.optimizedBytes, 0);
  console.log(`Lossless WebP: ${files.length} images, ${(before / 1048576).toFixed(1)} -> ${(after / 1048576).toFixed(1)} MB (${((1 - after / before) * 100).toFixed(1)}% smaller).`);
  return {
    mapping,
    async writeOutput() {
      for (const item of results) {
        if (item.path === item.outputPath) continue;
        const output = join(outputRoot, item.outputPath);
        await mkdir(dirname(output), { recursive: true });
        await copyFile(item.cached, output);
      }
      const report = results.map(({ cached, ...item }) => item);
      await writeFile(join(outputRoot, 'image-optimization.json'), JSON.stringify(report, null, 2));
    },
  };
}
