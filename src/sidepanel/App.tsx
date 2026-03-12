import { useState, useCallback, useMemo, useEffect } from "react";
import { Box, Button, Typography, Tooltip } from "@mui/material";

import { CopyPasteText } from "./CopyPasteText";
import { Tag } from "./Tag";
import { WordInput, createBuckets } from "./TabsPanel";
import { CharBucket } from "./CharBucket";

const isExtension = typeof chrome !== "undefined" && !!chrome?.tabs;
const SLOT_COUNT = 13;
const PULL_PATTERNS = ["/shop-by-image/", "/en/wallpaper/"];

const emptyTags = (): string[][] => new Array(SLOT_COUNT).fill(null).map(() => []);

function App() {
  const [currentTags, setCurrentTags] = useState<string[][]>(emptyTags);
  const [finalKeywordString, setFinalKeywordString] = useState("");
  const [pageStatus, setPageStatus] = useState<string>("");
  const [activeTabUrl, setActiveTabUrl] = useState<string>("");

  useEffect(() => {
    if (!isExtension) return;
    const updateUrl = () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        setActiveTabUrl(tabs[0]?.url ?? "");
      });
    };
    updateUrl();
    chrome.tabs.onUpdated.addListener(updateUrl);
    chrome.tabs.onActivated.addListener(updateUrl);
    return () => {
      chrome.tabs.onUpdated.removeListener(updateUrl);
      chrome.tabs.onActivated.removeListener(updateUrl);
    };
  }, []);

  const pullEnabled = isExtension && PULL_PATTERNS.some((p) => activeTabUrl.includes(p));

  const [wordSoup, setWordSoup] = useState("");
  const [charBuckets, setCharBuckets] = useState<Record<string, string[]>>({});

  const addWordsToSoup = useCallback((newWords: string) => {
    setWordSoup((prev) => {
      const existing = new Set(prev.split(/\s+/).filter(Boolean));
      const incoming = newWords.split(/\s+/).filter(Boolean);
      const fresh = incoming.filter((w) => !existing.has(w));
      if (fresh.length === 0) return prev;
      const updated = prev ? `${prev} ${fresh.join(" ")}` : fresh.join(" ");
      setCharBuckets(createBuckets(updated));
      return updated;
    });
  }, []);

  const removeWordFromSoup = useCallback((word: string) => {
    setWordSoup((prev) => {
      const escaped = word.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "i");
      const updated = prev.replace(regex, "").trim().replace(/\s{2,}/g, " ");
      setCharBuckets(createBuckets(updated));
      return updated;
    });
  }, []);

  const hasBuckets = Object.keys(charBuckets).length > 0;

  const tempKeywordString = currentTags
    .filter((t) => t.length > 0)
    .map((t) => t.join(" "))
    .join(", ");

  const charsUsed = tempKeywordString.length;

  const usedWords = useMemo(
    () => new Set(currentTags.flat().flatMap((w) => w.split(/\s+/).filter(Boolean))),
    [currentTags]
  );

  const addWordToTag = useCallback((tagIndex: number, word: string) => {
    setCurrentTags((prev) => {
      const next = prev.map((t) => [...t]);
      next[tagIndex] = [...next[tagIndex], word];
      return next;
    });
    addWordsToSoup(word);
  }, [addWordsToSoup]);

  const removeWordFromTag = useCallback((tagIndex: number, wordIndex: number) => {
    setCurrentTags((prev) => {
      const next = prev.map((t) => [...t]);
      next[tagIndex] = next[tagIndex].filter((_, i) => i !== wordIndex);
      return next;
    });
  }, []);

  const reorderWordsInTag = useCallback((tagIndex: number, fromIdx: number, toIdx: number) => {
    setCurrentTags((prev) => {
      const next = prev.map((t) => [...t]);
      const words = [...next[tagIndex]];
      const [moved] = words.splice(fromIdx, 1);
      const insertAt = fromIdx < toIdx ? toIdx - 1 : toIdx;
      words.splice(insertAt, 0, moved);
      next[tagIndex] = words;
      return next;
    });
  }, []);

  const moveWordBetweenTags = useCallback((fromTag: number, wordIdx: number, toTag: number) => {
    setCurrentTags((prev) => {
      const next = prev.map((t) => [...t]);
      const word = next[fromTag][wordIdx];
      next[fromTag] = next[fromTag].filter((_, i) => i !== wordIdx);
      next[toTag] = [...next[toTag], word];
      return next;
    });
  }, []);

  const editWordInTag = useCallback((tagIndex: number, wordIndex: number, newWord: string) => {
    setCurrentTags((prev) => {
      const oldWord = prev[tagIndex][wordIndex];

      setWordSoup((prevSoup) => {
        const escaped = oldWord.replace(/[-.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "i");
        let updated: string;
        if (regex.test(prevSoup)) {
          updated = prevSoup.replace(regex, `$1${newWord}`);
        } else {
          updated = prevSoup ? `${prevSoup} ${newWord}` : newWord;
        }
        setCharBuckets(createBuckets(updated));
        return updated;
      });

      const next = prev.map((t) => [...t]);
      next[tagIndex][wordIndex] = newWord;
      return next;
    });
  }, []);

  const pullTagsFromPage = () => {
    if (!isExtension) {
      setPageStatus("Pull/push only works in the Chrome extension, not dev mode.");
      return;
    }
    setPageStatus("");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "getTags" }, (response) => {
        if (chrome.runtime.lastError) {
          setPageStatus("Could not connect to page. Make sure you're on a Spoonflower listing page.");
          return;
        }
        if (response?.tags) {
          const tags = response.tags as string[];
          if (response.mode === "append") {
            addWordsToSoup(tags.join(" ").toLowerCase());
            setPageStatus(`Added keywords from ${tags.length} design(s)`);
          } else {
            const newTags = emptyTags();
            tags.forEach((tag, i) => {
              if (i < SLOT_COUNT) {
                newTags[i] = tag.split(/\s+/).filter(Boolean);
              }
            });
            setCurrentTags(newTags);
            setPageStatus(`Pulled ${tags.length} tag(s) from page`);
          }
        } else {
          setPageStatus(response?.error || "No tags found on this page.");
        }
      });
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", overflow: "hidden" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 0.5,
          flexShrink: 0,
          gap: 0.5,
        }}
      >
        <Tooltip title={pullEnabled ? "Pull tags from page" : "Only active on image search or product listing pages"}>
          <span>
            <Button
              variant="outlined"
              size="small"
              onClick={pullTagsFromPage}
              disabled={!pullEnabled}
              sx={{ fontSize: "0.75rem", textTransform: "none", whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Pull from page
            </Button>
          </span>
        </Tooltip>

        {pageStatus && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              color: pageStatus.includes("Could not") || pageStatus.includes("No tags")
                ? "error.main"
                : "success.main",
              ml: "auto",
              textAlign: "right",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            {pageStatus}
          </Typography>
        )}
      </Box>

      {/* Word input */}
      <Box
        sx={{
          flexShrink: 0,
          px: 1,
          py: 0.75,
        }}
      >
        <WordInput onAddWords={addWordsToSoup} />
      </Box>

      {/* Buckets pane */}
      <Box
        sx={{
          flexShrink: 0,
          maxHeight: "40vh",
          overflowY: "auto",
          px: 1,
          py: 0.5,
        }}
      >
        {hasBuckets && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              mt: 0.5,
            }}
          >
            {Object.entries(charBuckets).map(([length, words]) => (
              <CharBucket
                key={length}
                length={length}
                words={words}
                usedWords={usedWords}
                onRemoveWord={removeWordFromSoup}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Bottom pane: tag slots */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 1,
          pt: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "0.8rem" }}>Plan your tags</Typography>
          <Typography
            variant="caption"
            sx={{ color: charsUsed > 284 ? "error.main" : "text.secondary" }}
          >
            {charsUsed}/284 chars
          </Typography>
        </Box>

        {currentTags.map((words, i) => (
          <Tag
            key={i}
            words={words}
            tagIndex={i}
            onAddWord={addWordToTag}
            onRemoveWord={removeWordFromTag}
            onReorder={reorderWordsInTag}
            onMoveWord={moveWordBetweenTags}
            onEditWord={editWordInTag}
          />
        ))}

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1, mb: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setCurrentTags(emptyTags());
              setFinalKeywordString("");
              setCharBuckets({});
              setWordSoup("");
              setPageStatus("");
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={
              !currentTags.some((t) => t.length > 0) ||
              tempKeywordString.length > 284
            }
            onClick={() => {
              setFinalKeywordString(tempKeywordString);
            }}
          >
            Done!
          </Button>
        </Box>

        {finalKeywordString && (
          <Box sx={{ mb: 1 }}>
            <CopyPasteText text={finalKeywordString} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default App;
