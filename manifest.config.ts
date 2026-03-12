import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Spoonflower Tag Helper",
  version: "1.0.0",
  description:
    "Plan and optimize your Spoonflower listing tags directly in your seller workspace",
  permissions: ["sidePanel", "activeTab", "scripting"],
  host_permissions: ["https://*.spoonflower.com/*"],
  side_panel: {
    default_path: "sidepanel.html",
  },
  background: {
    service_worker: "src/background/background.ts",
  },
  content_scripts: [
    {
      matches: ["https://*.spoonflower.com/*"],
      js: ["src/content/content.ts"],
      run_at: "document_idle",
    },
  ],
  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },
  action: {
    default_title: "Open Tag Helper",
  },
});
