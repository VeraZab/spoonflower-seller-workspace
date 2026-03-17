/**
 * Content script that runs on Spoonflower pages.
 * Handles reading and writing tags from/to the listing editor.
 *
 * Spoonflower's design editor uses tag input fields. This script
 * attempts multiple strategies to find and interact with them.
 */

type TagResponse = { tags: string[]; mode?: "replace" | "append" } | { error: string };

type ProductCardSelectorSet = {
  name: string;
  card: string;
  title: string;
  image: string;
  imageLink: string;
};

type ProductDetailSelectorSet = {
  name: string;
  tagLinkSelectors: string[];
};

const PRODUCT_CARD_SELECTOR_SETS: ProductCardSelectorSet[] = [
  // Primary set for current Spoonflower product cards.
  {
    name: "productCard-data-testid",
    card: '[data-testid="productCard-card"]',
    title: '[data-testid="productCard-title"]',
    image: '[data-testid="productCard-image"]',
    imageLink: '[data-testid="productCard-image-link"]',
  },
  // Fallback set if data-testid values are removed/renamed but class fragments remain.
  {
    name: "productCard-class-fallback",
    card: '[class*="ProductCard_card"]',
    title: '[class*="ProductCard_title"]',
    image: '[class*="ProductCard_image"]',
    imageLink: 'a[class*="ProductCard_imageWrapper"]',
  },
];

const PRODUCT_DETAIL_SELECTOR_SETS: ProductDetailSelectorSet[] = [
  {
    name: "product-detail-data-testid",
    tagLinkSelectors: [
      '[data-testid="productTags"] a',
      '[data-testid="exploreMoreTags"] a',
      "a[aria-label^='Shop for']",
    ],
  },
  {
    name: "product-detail-legacy-tag-links",
    tagLinkSelectors: ["a[aria-label^='Shop for']"],
  },
];

const LEGACY_IMAGE_LINK_SELECTORS: string[] = [
  'a[data-testid="productCard-image-link"][aria-label]',
  'a[class*="ProductCard_imageWrapper"][aria-label]',
];

const EXTRACTION_RETRY_DELAYS_MS = [0, 200, 600, 1200];

function cleanProductLabel(text: string): string {
  return text
    .replace(/^View\s+/i, "")
    .replace(/\s+by\s+\S+$/i, "")
    .trim();
}

function splitKeywords(raw: string): string[] {
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function extractSingleProductPageTags(): string[] {
  const tags: string[] = [];

  for (const set of PRODUCT_DETAIL_SELECTOR_SETS) {
    for (const selector of set.tagLinkSelectors) {
      const links = document.querySelectorAll<HTMLAnchorElement>(selector);
      tags.push(
        ...Array.from(links)
          .map((a) => cleanProductLabel(a.textContent ?? ""))
          .filter(Boolean)
      );
    }
  }

  return [...new Set(tags.map((t) => t.trim()).filter(Boolean))];
}

function extractFromProductCards(set: ProductCardSelectorSet): string[] {
  const cards = document.querySelectorAll<HTMLElement>(set.card);
  if (cards.length === 0) return [];

  return Array.from(cards)
    .map((card) => {
      const titleEl = card.querySelector<HTMLAnchorElement>(set.title);
      if (titleEl?.textContent?.trim()) return titleEl.textContent.trim();

      const image = card.querySelector<HTMLImageElement>(set.image);
      if (image?.alt?.trim()) return image.alt.trim();

      const imageLink = card.querySelector<HTMLAnchorElement>(set.imageLink);
      return cleanProductLabel(imageLink?.getAttribute("aria-label") ?? "");
    })
    .filter(Boolean);
}

function extractFromLegacyImageLinks(): string[] {
  for (const selector of LEGACY_IMAGE_LINK_SELECTORS) {
    const links = document.querySelectorAll<HTMLAnchorElement>(selector);
    if (links.length === 0) continue;
    const tags = Array.from(links)
      .map((a) => cleanProductLabel(a.getAttribute("aria-label") ?? ""))
      .filter(Boolean);
    if (tags.length > 0) return tags;
  }
  return [];
}

function getProductCardDebugSnapshot(): string {
  const selectorSnapshot = PRODUCT_CARD_SELECTOR_SETS.map((set) => {
    const cards = document.querySelectorAll(set.card).length;
    const titles = document.querySelectorAll(set.title).length;
    const images = document.querySelectorAll(set.image).length;
    const imageLinks = document.querySelectorAll(set.imageLink).length;
    return `${set.name}{cards=${cards},titles=${titles},images=${images},imageLinks=${imageLinks}}`;
  }).join(" ");

  const legacySnapshot = LEGACY_IMAGE_LINK_SELECTORS.map((selector) => {
    const count = document.querySelectorAll(selector).length;
    return `${selector}=${count}`;
  }).join(" ");

  const detailSnapshot = PRODUCT_DETAIL_SELECTOR_SETS.map((set) => {
    const tagLinks = set.tagLinkSelectors.map((selector) => `${selector}=${document.querySelectorAll(selector).length}`).join(",");
    return `${set.name}{tagLinks=[${tagLinks}]}`;
  }).join(" ");

  return `url=${location.pathname} ${detailSnapshot} ${selectorSnapshot} legacy{${legacySnapshot}}`;
}

function getTagsFromPageOnce(): TagResponse {
  // Strategy 1: Look for tag input fields in the design editor
  // Spoonflower uses input fields or contenteditable elements for tags
  const tagInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name*="tag"], input[placeholder*="tag" i], input[aria-label*="tag" i]'
  );

  if (tagInputs.length > 0) {
    const tags = Array.from(tagInputs)
      .map((input) => input.value.trim())
      .filter(Boolean);
    if (tags.length > 0) return { tags };
  }

  // Strategy 2: Look for a comma-separated tag field (textarea or input)
  const keywordFields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'textarea[name*="keyword" i], textarea[name*="tag" i], input[name*="keyword" i], ' +
    'textarea[placeholder*="keyword" i], input[placeholder*="keyword" i]'
  );

  for (const field of keywordFields) {
    if (field.value.trim()) {
      const tags = field.value.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length > 0) return { tags };
    }
  }

  // Strategy 3: Look for chip/badge elements that represent tags
  const chips = document.querySelectorAll(
    '[class*="chip" i], [class*="tag-item" i], [class*="tag_item" i], [class*="keyword" i]'
  );

  if (chips.length > 0) {
    const tags = Array.from(chips)
      .map((chip) => chip.textContent?.trim() ?? "")
      .filter(Boolean);
    if (tags.length > 0) return { tags };
  }

  // Strategy 4: Single product detail pages.
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] ?? "";
  const singleProductTags = extractSingleProductPageTags();
  if (singleProductTags.length > 0 && /^\d{5,}-/.test(lastSegment)) {
    return { tags: singleProductTags };
  }

  // Strategy 5: "Explore more tags" section links (for public listing pages)
  const exploreLinks = document.querySelectorAll<HTMLAnchorElement>(
    "a[aria-label^='Shop for']"
  );

  if (exploreLinks.length > 0) {
    const tags = Array.from(exploreLinks)
      .map((a) => a.innerText.trim())
      .filter(Boolean);
    if (tags.length > 0) return { tags };
  }

  // Strategy 6: Product cards on browse/search pages using ranked selector sets.
  for (const set of PRODUCT_CARD_SELECTOR_SETS) {
    const tags = extractFromProductCards(set);
    const unique = [...new Set(tags)];
    if (unique.length > 0) return { tags: unique, mode: "append" };
  }

  // Strategy 7: Legacy/fallback selectors if card wrapper is absent.
  const legacyTags = extractFromLegacyImageLinks();
  if (legacyTags.length > 0) {
    return { tags: [...new Set(legacyTags)], mode: "append" };
  }

  return { error: "No tags found" };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTagsFromPage(): Promise<TagResponse> {
  for (let i = 0; i < EXTRACTION_RETRY_DELAYS_MS.length; i += 1) {
    const delay = EXTRACTION_RETRY_DELAYS_MS[i];
    if (delay > 0) await wait(delay);

    const result = getTagsFromPageOnce();
    if ("tags" in result) return result;

    // If we can already see tag-ish input controls, don't keep retrying.
    if (!result.error.includes("No tags found")) return result;
  }

  return getTagsFromPageOnce();
}

function setTagsOnPage(tags: string[]): { success: boolean } | { error: string } {
  const tagString = tags.join(", ");

  // Strategy 1: Find the keyword/tag textarea or input and fill it
  const keywordFields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'textarea[name*="keyword" i], textarea[name*="tag" i], input[name*="keyword" i], ' +
    'textarea[placeholder*="keyword" i], input[placeholder*="keyword" i], ' +
    'textarea[placeholder*="tag" i]'
  );

  for (const field of keywordFields) {
    setNativeValue(field, tagString);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.dispatchEvent(new Event("blur", { bubbles: true }));
    return { success: true };
  }

  // Strategy 2: Individual tag inputs
  const tagInputs = document.querySelectorAll<HTMLInputElement>(
    'input[name*="tag"], input[placeholder*="tag" i], input[aria-label*="tag" i]'
  );

  if (tagInputs.length > 0) {
    tags.forEach((tag, i) => {
      if (i < tagInputs.length) {
        setNativeValue(tagInputs[i], tag);
        tagInputs[i].dispatchEvent(new Event("input", { bubbles: true }));
        tagInputs[i].dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    return { success: true };
  }

  return { error: "Could not find tag fields on this page. Make sure you're in the design editor." };
}

/**
 * Sets a value on a React-controlled input by writing to the native
 * value setter, bypassing React's synthetic event system.
 */
function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;
  const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
    nativeTextAreaValueSetter.call(element, value);
  } else if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getTags") {
    getTagsFromPage()
      .then((result) => sendResponse(result))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        sendResponse({ error: `Tag extraction failed: ${message}` });
      });
  } else if (message.action === "setTags") {
    sendResponse(setTagsOnPage(message.tags));
  }
  return true;
});
