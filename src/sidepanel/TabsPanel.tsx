import { ChangeEvent, FocusEvent } from "react";
import { Box, TextField } from "@mui/material";

const createBuckets = (text: string) => {
  const words = text
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter((word) => word.trim() !== "");

  const buckets: Record<number, string[]> = {};
  words.forEach((word) => {
    const length = word.length;
    if (length < 3) return;
    if (!buckets[length]) {
      buckets[length] = [];
    }
    buckets[length].push(word);
  });
  return buckets;
};

interface WordSoupProps {
  wordSoup: string;
  setWordSoup: (value: string) => void;
  setCharBuckets: (buckets: Record<string, string[]>) => void;
}

export function WordSoup({
  wordSoup,
  setWordSoup,
  setCharBuckets,
}: WordSoupProps) {
  const handleEnter = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      (e.target as HTMLTextAreaElement).blur();
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        multiline
        fullWidth
        minRows={2}
        maxRows={4}
        size="small"
        placeholder="Paste keyword ideas here, press Enter to bucket by char length"
        value={wordSoup}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          setWordSoup(e.target.value.toLowerCase());
        }}
        onBlur={(e: FocusEvent<HTMLTextAreaElement>) => {
          setCharBuckets(createBuckets(e.target.value));
        }}
        onKeyDown={handleEnter}
        sx={{ "& .MuiInputBase-input": { fontSize: "0.8rem" } }}
      />
    </Box>
  );
}

export { createBuckets };
