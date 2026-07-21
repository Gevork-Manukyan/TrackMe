// Rasterises assets/icon.svg into the PNG sizes the PWA manifest and iOS need.
// Run with: node scripts/generate-icons.mjs
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const svg = await readFile(new URL("../assets/icon.svg", import.meta.url));

await mkdir(new URL("../public/icons/", import.meta.url), { recursive: true });

const targets = [
  { out: "../public/icons/icon-192.png", size: 192 },
  { out: "../public/icons/icon-512.png", size: 512 },
  // Maskable uses the same artwork: it already sits inside the 80% safe zone,
  // and the background is full-bleed so any mask shape crops cleanly.
  { out: "../public/icons/icon-maskable-512.png", size: 512 },
  // Next.js metadata file conventions — picked up automatically from app/.
  { out: "../src/app/icon.png", size: 256 },
  { out: "../src/app/apple-icon.png", size: 180 },
];

for (const { out, size } of targets) {
  const buf = await sharp(svg, { density: 512 })
    .resize(size, size)
    .png()
    .toBuffer();
  await writeFile(new URL(out, import.meta.url), buf);
  console.log(`wrote ${out.replace("../", "")} (${size}x${size}, ${buf.length} bytes)`);
}
