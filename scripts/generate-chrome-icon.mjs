#!/usr/bin/env node
/**
 * Generates Chrome Web Store compliant 128x128 icon.
 * Spec: 96x96 icon content, 16px transparent padding per side, PNG format.
 * Uses public/icons/icon128-chrome.svg as source.
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "icons", "icon128-chrome.svg");
const outPath = join(root, "public", "icons", "icon128.png");

const svg = readFileSync(svgPath);

await sharp(svg)
  .resize(128, 128)
  .png()
  .toFile(outPath);

console.log("Generated:", outPath);
