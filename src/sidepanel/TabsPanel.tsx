import { useState, ChangeEvent, ClipboardEvent } from "react";
import { Box, TextField } from "@mui/material";

const createBuckets = (text: string) => {
  const words = text
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter((word) => word.trim() !== "");

  const seen = new Set<string>();
  const buckets: Record<number, string[]> = {};
  words.forEach((word) => {
    if (seen.has(word)) return;
    seen.add(word);
    const length = word.length;
    if (length < 3) return;
    if (!buckets[length]) {
      buckets[length] = [];
    }
    buckets[length].push(word);
  });
  return buckets;
};

interface WordInputProps {
  onAddWords: (words: string) => void;
}

export function WordInput({ onAddWords }: WordInputProps) {
  const [inputText, setInputText] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.toLowerCase();
    const parts = text.replace(/,/g, " ").split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
      setInputText("");
      return;
    }

    // Multiple words = paste or multi-word input → bucket all immediately
    if (parts.length > 1) {
      const endsWithSpace = /[\s,]$/.test(text);
      if (endsWithSpace) {
        onAddWords(parts.join(" "));
        setInputText("");
      } else {
        onAddWords(parts.slice(0, -1).join(" "));
        setInputText(parts[parts.length - 1]);
      }
      return;
    }

    // Single word — bucket on trailing space, otherwise keep typing
    if (/[\s,]$/.test(text)) {
      onAddWords(parts[0]);
      setInputText("");
    } else {
      setInputText(text);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toLowerCase();
    const all = (inputText + " " + pasted).trim();
    if (all) {
      const words = all.replace(/,/g, " ").split(/\s+/).filter(Boolean);
      onAddWords(words.join(" "));
      setInputText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = inputText.trim();
      if (trimmed) {
        onAddWords(trimmed);
        setInputText("");
      }
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        variant="outlined"
        fullWidth
        size="small"
        placeholder="Type words to bucket (space to add)"
        value={inputText}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        sx={{
          "& .MuiInputBase-input": {
            fontSize: "0.8rem",
            py: 0.5,
          },
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px",
          },
        }}
      />
    </Box>
  );
}

export { createBuckets };
