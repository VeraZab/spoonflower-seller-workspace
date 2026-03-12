function getTagsFromPage() {
  const tagInputs = document.querySelectorAll(
    'input[name*="tag"], input[placeholder*="tag" i], input[aria-label*="tag" i]'
  );
  if (tagInputs.length > 0) {
    const tags = Array.from(tagInputs).map((input) => input.value.trim()).filter(Boolean);
    if (tags.length > 0) return { tags };
  }
  const keywordFields = document.querySelectorAll(
    'textarea[name*="keyword" i], textarea[name*="tag" i], input[name*="keyword" i], textarea[placeholder*="keyword" i], input[placeholder*="keyword" i]'
  );
  for (const field of keywordFields) {
    if (field.value.trim()) {
      const tags = field.value.split(",").map((t) => t.trim()).filter(Boolean);
      if (tags.length > 0) return { tags };
    }
  }
  const chips = document.querySelectorAll(
    '[class*="chip" i], [class*="tag-item" i], [class*="tag_item" i], [class*="keyword" i]'
  );
  if (chips.length > 0) {
    const tags = Array.from(chips).map((chip) => chip.textContent?.trim() ?? "").filter(Boolean);
    if (tags.length > 0) return { tags };
  }
  const exploreLinks = document.querySelectorAll(
    "a[aria-label^='Shop for']"
  );
  if (exploreLinks.length > 0) {
    const tags = Array.from(exploreLinks).map((a) => a.innerText.trim()).filter(Boolean);
    if (tags.length > 0) return { tags };
  }
  const productCards = document.querySelectorAll(
    'a[data-testid="productCard-image-link"][aria-label]'
  );
  if (productCards.length > 0) {
    const tags = Array.from(productCards).map((a) => {
      let label = a.getAttribute("aria-label")?.trim() ?? "";
      label = label.replace(/^View\s+/i, "").replace(/\s+by\s+\S+$/i, "");
      return label;
    }).filter(Boolean);
    const unique = [...new Set(tags)];
    if (unique.length > 0) return { tags: unique, mode: "append" };
  }
  return { error: "No tags found. Navigate to a Spoonflower design editor or listing page." };
}
function setTagsOnPage(tags) {
  const tagString = tags.join(", ");
  const keywordFields = document.querySelectorAll(
    'textarea[name*="keyword" i], textarea[name*="tag" i], input[name*="keyword" i], textarea[placeholder*="keyword" i], input[placeholder*="keyword" i], textarea[placeholder*="tag" i]'
  );
  for (const field of keywordFields) {
    setNativeValue(field, tagString);
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
    field.dispatchEvent(new Event("blur", { bubbles: true }));
    return { success: true };
  }
  const tagInputs = document.querySelectorAll(
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
function setNativeValue(element, value) {
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
