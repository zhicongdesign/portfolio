import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('public/assets/3d/hero-pang-optimized.glb');
const input = await readFile(source);

if (input.toString('ascii', 0, 4) !== 'glTF' || input.readUInt32LE(4) !== 2) {
  throw new Error('Expected a glTF 2.0 binary file.');
}

const jsonLength = input.readUInt32LE(12);
const original = JSON.parse(input.toString('utf8', 20, 20 + jsonLength));
const binaryOffset = 20 + jsonLength + 8;
const primitive = original.meshes?.[0]?.primitives?.[0];
const position = original.accessors?.[primitive?.attributes?.POSITION];
const normal = original.accessors?.[primitive?.attributes?.NORMAL];
const indices = original.accessors?.[primitive?.indices];

if (!position || !normal || !indices ||
    position.componentType !== 5122 || normal.componentType !== 5122 ||
    indices.componentType !== 5125 || position.count !== normal.count) {
  throw new Error('Unexpected hero mesh layout; inspect it before simplifying.');
}

const positionOffset = binaryOffset + original.bufferViews[position.bufferView].byteOffset;
const normalOffset = binaryOffset + original.bufferViews[normal.bufferView].byteOffset;
const indexOffset = binaryOffset + original.bufferViews[indices.bufferView].byteOffset;

async function createVariant(name, positionStep, normalStep) {
  // The desktop and mobile grids are both finer than a screen pixel at their
  // target sizes. Keep distinct normal sectors so the letter edges stay crisp.
  const clusters = new Map();
  const vertices = [];
  const remap = new Uint32Array(position.count);

  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const p = positionOffset + vertex * 8;
    const n = normalOffset + vertex * 8;
    const xyz = [input.readInt16LE(p), input.readInt16LE(p + 2), input.readInt16LE(p + 4)];
    const normalXYZ = [input.readInt16LE(n), input.readInt16LE(n + 2), input.readInt16LE(n + 4)];
    const key = [
      ...xyz.map((value) => Math.floor((value + 32768) / positionStep)),
      ...normalXYZ.map((value) => Math.floor((value + 32768) / normalStep)),
    ].join(',');
    let cluster = clusters.get(key);
    if (cluster === undefined) {
      cluster = vertices.length;
      clusters.set(key, cluster);
      vertices.push({ position: [0, 0, 0], normal: [0, 0, 0], count: 0, firstNormal: normalXYZ });
    }
    const target = vertices[cluster];
    for (let axis = 0; axis < 3; axis += 1) {
      target.position[axis] += xyz[axis];
      target.normal[axis] += normalXYZ[axis];
    }
    target.count += 1;
    remap[vertex] = cluster;
  }

  const triangles = [];
  const seen = new Set();
  for (let offset = 0; offset < indices.count; offset += 3) {
    const triangle = [0, 1, 2].map((corner) => remap[input.readUInt32LE(indexOffset + (offset + corner) * 4)]);
    if (triangle[0] === triangle[1] || triangle[1] === triangle[2] || triangle[2] === triangle[0]) continue;
    const key = [...triangle].sort((a, b) => a - b).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    triangles.push(...triangle);
  }

  const positions = Buffer.alloc(vertices.length * 8);
  const normals = Buffer.alloc(vertices.length * 8);
  const min = [32767, 32767, 32767];
  const max = [-32767, -32767, -32767];
  for (let index = 0; index < vertices.length; index += 1) {
    const vertex = vertices[index];
    const normalLength = Math.hypot(...vertex.normal);
    for (let axis = 0; axis < 3; axis += 1) {
      const value = Math.round(vertex.position[axis] / vertex.count);
      positions.writeInt16LE(value, index * 8 + axis * 2);
      min[axis] = Math.min(min[axis], value);
      max[axis] = Math.max(max[axis], value);
      const normalValue = normalLength > 0
        ? Math.round(vertex.normal[axis] / normalLength * 32767)
        : vertex.firstNormal[axis];
      normals.writeInt16LE(normalValue, index * 8 + axis * 2);
    }
  }

  const useUint16 = vertices.length <= 65535;
  const indexBytes = Buffer.alloc(triangles.length * (useUint16 ? 2 : 4));
  triangles.forEach((vertex, index) => {
    if (useUint16) indexBytes.writeUInt16LE(vertex, index * 2);
    else indexBytes.writeUInt32LE(vertex, index * 4);
  });

  const document = structuredClone(original);
  document.bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: positions.length, byteStride: 8, target: 34962 },
    { buffer: 0, byteOffset: positions.length, byteLength: normals.length, byteStride: 8, target: 34962 },
    { buffer: 0, byteOffset: positions.length + normals.length, byteLength: indexBytes.length, target: 34963 },
  ];
  document.accessors = [
    { bufferView: 0, componentType: 5122, count: vertices.length, normalized: true, min, max, type: 'VEC3' },
    { bufferView: 1, componentType: 5122, count: vertices.length, normalized: true, type: 'VEC3' },
    { bufferView: 2, componentType: useUint16 ? 5123 : 5125, count: triangles.length,
      min: [0], max: [vertices.length - 1], type: 'SCALAR' },
  ];
  document.buffers = [{ byteLength: positions.length + normals.length + indexBytes.length }];
  document.meshes[0].primitives[0].attributes = { POSITION: 0, NORMAL: 1 };
  document.meshes[0].primitives[0].indices = 2;

  const json = Buffer.from(JSON.stringify(document));
  const jsonPadding = Buffer.alloc((4 - json.length % 4) % 4, 0x20);
  const binary = Buffer.concat([positions, normals, indexBytes]);
  const binaryPadding = Buffer.alloc((4 - binary.length % 4) % 4);
  const header = Buffer.alloc(28);
  header.write('glTF', 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + json.length + jsonPadding.length + binary.length + binaryPadding.length, 8);
  header.writeUInt32LE(json.length + jsonPadding.length, 12);
  header.write('JSON', 16);
  header.writeUInt32LE(binary.length + binaryPadding.length, 20);
  header.write('BIN\0', 24);

  const output = resolve(`public/assets/3d/hero-pang-${name}.glb`);
  await writeFile(output, Buffer.concat([
    header.subarray(0, 20), json, jsonPadding,
    header.subarray(20), binary, binaryPadding,
  ]));
  console.log(`${name}: ${vertices.length} vertices, ${triangles.length / 3} triangles, ${((await readFile(output)).length / 1048576).toFixed(2)} MiB`);
}

await createVariant('desktop', 32, 1024);
await createVariant('mobile', 64, 4096);
