# Chrome Web Store Submission Checklist

Use this runbook each time you publish a new version.

## Quick release flow

- [ ] Bump version in `manifest.config.ts`
- [ ] Build package with `npm run package:chrome`
- [ ] Verify extension locally from `dist/`
- [ ] Upload zip from `release/` in Chrome Developer Dashboard
- [ ] Resolve warnings and submit

## 1) Preflight (once per machine / as needed)

- [ ] Run `npm install` (if dependencies changed or first run on this machine)
- [ ] Confirm listing copy source exists: `CHROME_WEB_STORE_LISTING_README.md`

## 2) Build and package

- [ ] Run `npm run package:chrome`
- [ ] Confirm output zip exists in `release/`
  - expected format: `spoonflower-seller-lab-v<version>.zip`
- [ ] Confirm `dist/manifest.json` has expected version and permissions

## 3) Local QA before upload

- [ ] Open `chrome://extensions`
- [ ] Enable Developer mode
- [ ] Load or refresh unpacked extension from `dist/`
- [ ] Open Spoonflower pages and confirm:
  - [ ] side panel opens from extension action
  - [ ] pull tags works on search/browse pages
  - [ ] pull tags works on single product pages
  - [ ] copy output works
  - [ ] "No tags found" appears when page has no tags
- [ ] Check for zero runtime errors in:
  - [ ] extension service worker console
  - [ ] side panel console
  - [ ] Spoonflower page console (content script)

## 4) Store listing and policy fields

- [ ] Use `CHROME_WEB_STORE_LISTING_README.md` for all paste-ready text
- [ ] Confirm screenshot upload order:
  - [ ] `public/icons/extension-screenshot-2.png` (first)
  - [ ] `public/icons/extension-screenshot.png` (second)
- [ ] Confirm permission scope matches manifest:
  - [ ] `sidePanel`
  - [ ] `activeTab` + `scripting`
  - [ ] `https://spoonflower.com/*` + `https://*.spoonflower.com/*`
- [ ] Confirm privacy disclosure remains accurate:
  - [ ] no remote code
  - [ ] no data sale
  - [ ] no unrelated host access
  - [ ] no external tracking/analytics

## 5) Upload and submit

- [ ] Open extension item in Chrome Developer Dashboard
- [ ] Upload the new zip from `release/`
- [ ] Resolve automated warnings (if any)
- [ ] Submit for review

## 6) Post-submit notes (recommended)

- [ ] Save release date and version in your notes
- [ ] Keep a copy of uploaded zip for rollback/reference
