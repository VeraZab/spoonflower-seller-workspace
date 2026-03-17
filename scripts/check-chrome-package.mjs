import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const manifestPath = path.join(distDir, "manifest.json");

function fail(message) {
  console.error(`\n[chrome-preflight] ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[chrome-preflight] ${message}`);
}

if (!fs.existsSync(distDir)) {
  fail("dist folder is missing. Run `npm run build` first.");
}

if (!fs.existsSync(manifestPath)) {
  fail("dist/manifest.json is missing. Build output is incomplete.");
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (manifest.manifest_version !== 3) {
  fail(`manifest_version must be 3 for Chrome Web Store. Got: ${manifest.manifest_version}`);
}

if (!manifest.name || !manifest.version || !manifest.description) {
  fail("manifest must include name, version, and description.");
}

if (manifest.version === "0.0.0") {
  fail("version cannot be 0.0.0 for store submission.");
}

const requiredIconSizes = ["16", "48", "128"];
for (const size of requiredIconSizes) {
  const iconPath = manifest.icons?.[size];
  if (!iconPath) {
    fail(`manifest.icons.${size} is missing.`);
  }

  const absIconPath = path.join(distDir, iconPath);
  if (!fs.existsSync(absIconPath)) {
    fail(`icon file is missing from dist: ${iconPath}`);
  }
}

if (!manifest.permissions?.includes("sidePanel")) {
  fail("manifest.permissions must include sidePanel for this extension.");
}

if (!manifest.host_permissions?.some((p) => p.includes("spoonflower.com"))) {
  fail("host_permissions must include Spoonflower domain.");
}

info("Manifest and build artifacts look ready for Chrome Web Store upload.");
