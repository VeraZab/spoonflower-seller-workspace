/**
 * Content script that runs on Spoonflower pages.
 * Handles reading and writing tags from/to the listing editor.
 *
 * Spoonflower's design editor uses tag input fields. This script
 * attempts multiple strategies to find and interact with them.
 */

function getTagsFromPage(): { tags: string[]; mode?: "replace" | "append" } | { error: string } {
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

  // Strategy 4: "Explore more tags" section links (for public listing pages)
  const exploreLinks = document.querySelectorAll<HTMLAnchorElement>(
    "a[aria-label^='Shop for']"
  );

  if (exploreLinks.length > 0) {
    const tags = Array.from(exploreLinks)
      .map((a) => a.innerText.trim())
      .filter(Boolean);
    if (tags.length > 0) return { tags };
  }

  // Strategy 5: Product cards on browse/search pages (e.g. /en/shop-by-image/)
  const productCards = document.querySelectorAll<HTMLAnchorElement>(
    'a[data-testid="productCard-image-link"][aria-label]'
  );

  if (productCards.length > 0) {
    const tags = Array.from(productCards)
      .map((a) => {
        let label = a.getAttribute("aria-label")?.trim() ?? "";
        label = label.replace(/^View\s+/i, "").replace(/\s+by\s+\S+$/i, "");
        return label;
      })
      .filter(Boolean);
    const unique = [...new Set(tags)];
    if (unique.length > 0) return { tags: unique, mode: "append" };
  }

  return { error: "No tags found. Navigate to a Spoonflower design editor or listing page." };
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
    sendResponse(getTagsFromPage());
  } else if (message.action === "setTags") {
    sendResponse(setTagsOnPage(message.tags));
  }
  return true;
});
