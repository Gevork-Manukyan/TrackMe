// Rasterises the icon artwork into every format the app needs.
// Run with: node scripts/generate-icons.mjs
//
// Two source drawings, same identity:
//   assets/icon.svg    — the full stamp (double ring + check), for large sizes
//   assets/favicon.svg — simplified for 16-32px: no inner ring, doubled strokes,
//                        because fine detail turns to mush at tab size
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const iconSvg = await readFile(new URL("../assets/icon.svg", import.meta.url));
const faviconSvg = await readFile(
  new URL("../assets/favicon.svg", import.meta.url),
);

const render = (svg, size) =>
  sharp(svg, { density: 512 }).resize(size, size).png().toBuffer();

/**
 * Minimal ICO encoder. An .ico is a 6-byte header, one 16-byte directory entry
 * per image, then the image payloads — and PNG payloads are valid in .ico for
 * every browser we care about. Encoding it here avoids a dependency.
 */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, buf }, i) => {
    const at = 16 * i;
    // 0 means 256 in the ICO spec.
    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2); // palette size
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // colour planes
    directory.writeUInt16LE(32, at + 6); // bits per pixel
    directory.writeUInt32LE(buf.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += buf.length;
  });

  return Buffer.concat([header, directory, ...images.map((i) => i.buf)]);
}

await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });

// --- Large icons: the full stamp ---
const large = [
  { out: "../public/icons/icon-192.png", size: 192 },
  { out: "../public/icons/icon-512.png", size: 512 },
  // Maskable reuses the artwork: it sits inside the 80% safe zone already, and
  // the background is full-bleed so any mask shape crops cleanly.
  { out: "../public/icons/icon-maskable-512.png", size: 512 },
  { out: "../src/app/apple-icon.png", size: 180 },
];

for (const { out, size } of large) {
  const buf = await render(iconSvg, size);
  await writeFile(new URL(out, import.meta.url), buf);
  console.log(`${out.replace("../", "")} — ${size}x${size}, ${buf.length}b`);
}

// --- Tab icons: the simplified stamp ---
// Browsers render these at 16-32px, so they use the bolder drawing.
const icoSizes = [16, 32, 48];
const icoImages = [];
for (const size of icoSizes) {
  icoImages.push({ size, buf: await render(faviconSvg, size) });
}
const ico = buildIco(icoImages);
await writeFile(new URL("../src/app/favicon.ico", import.meta.url), ico);
console.log(`src/app/favicon.ico — ${icoSizes.join("/")}px, ${ico.length}b`);

// A PNG fallback for browsers that prefer it over .ico.
const iconPng = await render(faviconSvg, 96);
await writeFile(new URL("../src/app/icon.png", import.meta.url), iconPng);
console.log(`src/app/icon.png — 96x96, ${iconPng.length}b`);
