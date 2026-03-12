# Spoonflower Tag Helper — Chrome Extension

A Chrome side panel extension that helps you plan and optimize your Spoonflower listing tags directly alongside the seller workspace.

## Features

- **Keyword Ideas** — paste raw keyword ideas, auto-grouped into character-length buckets
- **Rework Keywords** — paste existing comma-separated tags to edit and reorganize
- **13 tag slots** — plan each tag with character limit feedback (20 char guideline, 30 max)
- **284-character total limit** — live counter for the full keyword string
- **Pull from page** — read existing tags from the current Spoonflower listing page
- **Push to page** — write your optimized tags back into the Spoonflower editor
- **Copy to clipboard** — one-click copy of the final comma-separated tag string

## Install (Developer Mode)

1. Build the extension:

   ```bash
   cd spoonflower-tag-helper-ext
   npm install
   npm run build
   ```

2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `dist` folder
5. The extension icon appears in your toolbar — click it to open the side panel

## Usage

1. Navigate to a Spoonflower listing or design editor page
2. Click the extension icon to open the Tag Helper side panel
3. Use **Pull from page** to import existing tags, or start fresh with **Keyword Ideas**
4. Plan your 13 tags in the tag slots — the character counters help you stay within limits
5. Click **Done!** to generate the final keyword string
6. Use **Push to page** to apply tags back, or copy the string to paste manually

## Development

```bash
npm run dev     # watch mode — rebuilds on file changes
npm run build   # production build
```

After rebuilding, go to `chrome://extensions/` and click the refresh icon on the extension card.
