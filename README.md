# Spoonflower Tag Helper — Chrome Extension

A Chrome side panel extension that helps you plan and optimize your Spoonflower listing tags directly alongside the seller workspace. 

## Features

- **Keyword Ideas for New Listings** — paste raw keyword ideas or pull them from the shop-by-image page. Get auto-grouped keyword suggestions by character-length buckets. 
- **Rework Keywords for Existing Listings** — pull existing product page keywords and edit and reorganize them.
- **13 tag slots** — plan each tag with character limit feedback (20 char guideline). Drag and Drop and reorder keyword from char-length buckets.
- **20 Char per Tag LIVE Counter** — live counter for the full keyword string
- **Copy Final Keywords To Clipboard** — one-click copy of the final comma-separated tag string.


## Usage

1. Navigate to a Spoonflower listing or shop-by-image page with results of an image search.
2. Click the extension icon to open the Tag Helper side panel
3. Use **Pull from page** to import existing tags, or start fresh with **Keyword Ideas**
4. Plan your 13 tags in the tag slots — the character counters help you stay within limits
5. Click **Done!** to generate the final keyword string
6. Use **Copy To Clipboard Button** to copy the keyword tags string and paste manually back to Spoonflower.

## Chrome Web Store Copy (Checklist 3 and 4)

Use this section for copy/paste into the Chrome Web Store listing form.

### Store listing assets

- Extension name: `Spoonflower Tag Helper`
- Screenshot order:
  1. `public/icons/extension-screenshot-2.png`
  2. `public/icons/extension-screenshot.png`
- Icon: `128x128` icon included in extension package

### Short description

`Plan, optimize, and apply Spoonflower listing tags faster from a Chrome side panel.`

### Detailed description

Spoonflower Tag Helper helps sellers build stronger listing keywords without leaving Spoonflower.

Use the side panel to pull tags from the current Spoonflower page, organize words into 13 tag slots, and track character limits in real time. When your keyword plan is ready, copy your final keyword string or push tags back to the page.

What it helps with:

- Organizing raw keyword ideas into reusable word buckets
- Reworking existing tags into clearer, more searchable phrases
- Managing per-tag and total character limits
- Quickly copying or writing optimized tags back into your workflow

The extension only works on Spoonflower pages and is designed for listing/tag workflow support.

### Single-purpose description

`This extension helps Spoonflower sellers plan, optimize, and apply listing tags on Spoonflower pages.`

### Permissions justification

- `sidePanel`: Open the Tag Helper interface in the Chrome side panel.
- `activeTab` + `scripting`: Read and update listing tag fields on the currently active Spoonflower tab when the user clicks Pull/Push.
- `https://spoonflower.com/*` + `https://*.spoonflower.com/*`: Limit access to Spoonflower pages only for tag extraction and tag entry.

### Privacy disclosure

- no remote code
- no data sale
- no unrelated host access
- no external tracking or analytics
