import { useState, ChangeEvent, useCallback } from "react";
import { Box, Button, Typography, Divider, Tooltip } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

import { CopyPasteText } from "./CopyPasteText";
import { Tag } from "./Tag";
import { WordSoup, createBuckets } from "./TabsPanel";
import { CharBucket } from "./CharBucket";

const isExtension = typeof chrome !== "undefined" && !!chrome?.tabs;

function App() {
  const initialKeywords = new Array(13).fill("");
  const [currentTags, setCurrentTags] = useState<string[]>(initialKeywords);
  const [finalKeywordString, setFinalKeywordString] = useState("");
  const [pageStatus, setPageStatus] = useState<string>("");

  const [wordSoup, setWordSoup] = useState("");
  const [charBuckets, setCharBuckets] = useState<Record<string, string[]>>({});

  const tempKeywordString = currentTags
    .filter((k) => k.trim() !== "")
    .map((w) => w.trim())
    .join(", ");

  const charsUsed = tempKeywordString.length;

  const updateTags = useCallback(
    (e: ChangeEvent<HTMLInputElement>, tagIndex: number) => {
      const value = e?.target.value;
      const newTags = [...currentTags];
      newTags[tagIndex] = value;
      setCurrentTags(newTags);
    },
    [currentTags]
  );

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
            const soup = tags.join(" ").toLowerCase();
            setWordSoup((prev) => {
              const combined = prev ? `${prev} ${soup}` : soup;
              return combined;
            });
            setCharBuckets(createBuckets(wordSoup ? `${wordSoup} ${soup}` : soup));
            setPageStatus(`Added keywords from ${tags.length} design(s) to Keyword Ideas`);
          } else {
            const padded = [...tags, ...new Array(Math.max(0, 13 - tags.length)).fill("")];
            setCurrentTags(padded.slice(0, 13));
            setPageStatus(`Pulled ${tags.length} tag(s) from page`);
          }
        } else {
          setPageStatus(response?.error || "No tags found on this page.");
        }
      });
    });
  };

  const pushTagsToPage = () => {
    if (!isExtension) {
      setPageStatus("Pull/push only works in the Chrome extension, not dev mode.");
      return;
    }
    setPageStatus("");
    const tags = currentTags.filter((t) => t.trim() !== "");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "setTags", tags }, (response) => {
        if (chrome.runtime.lastError) {
          setPageStatus("Could not connect to page. Make sure you're on a Spoonflower listing page.");
          return;
        }
        if (response?.success) {
          setPageStatus("Tags applied to page!");
        } else {
          setPageStatus(response?.error || "Could not set tags on this page.");
        }
      });
    });
  };

  return (
    <Box sx={{ width: "100%", p: 1.5, pt: 0 }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: "background.default",
          zIndex: 10,
          pb: 1,
          pt: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ textAlign: "center", mb: 1 }}>
          Spoonflower Tag Helper
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 1 }}>
          <Tooltip title="Pull existing tags from the current Spoonflower page">
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={pullTagsFromPage}
            >
              Pull from page
            </Button>
          </Tooltip>
          <Tooltip title="Push your tags into the current Spoonflower page">
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadIcon />}
              onClick={pushTagsToPage}
              disabled={!currentTags.some((k) => Boolean(k.trim()))}
            >
              Push to page
            </Button>
          </Tooltip>
        </Box>

        {pageStatus && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: pageStatus.includes("Could not") || pageStatus.includes("No tags")
                ? "error.main"
                : "success.main",
              mb: 0.5,
            }}
          >
            {pageStatus}
          </Typography>
        )}
        <Divider />
      </Box>

      <Box sx={{ mt: 1 }}>
        <WordSoup
          wordSoup={wordSoup}
          setWordSoup={setWordSoup}
          setCharBuckets={setCharBuckets}
        />

        {Object.keys(charBuckets).length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              mt: 1,
              mb: 1,
            }}
          >
            {Object.entries(charBuckets).map(([length, words]) => (
              <CharBucket
                key={length}
                length={length}
                words={words}
                currentTags={currentTags}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>Plan your tags</Typography>
          <Typography
            variant="body2"
            sx={{ color: charsUsed > 284 ? "error.main" : "text.secondary" }}
          >
            {charsUsed}/284 chars
          </Typography>
        </Box>

        {currentTags.map((k, i) => (
          <Tag key={i} tag={k} tagIndex={i} onChange={updateTags} />
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2, mb: 1 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setCurrentTags([...initialKeywords]);
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
            !currentTags.some((k) => Boolean(k.trim())) ||
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
        <Box sx={{ mt: 1 }}>
          <CopyPasteText text={finalKeywordString} />
        </Box>
      )}
    </Box>
  );
}

export default App;
