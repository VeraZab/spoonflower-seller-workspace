import { DragEvent } from "react";
import { Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function CharBucket({
  words,
  length,
  usedWords,
  onRemoveWord,
}: {
  words: string[];
  length: string;
  usedWords: Set<string>;
  onRemoveWord: (word: string) => void;
}) {
  const uniqueWords = Array.from(new Set(words));

  if (!uniqueWords.length) return null;

  const handleDragStart = (e: DragEvent<HTMLDivElement>, word: string) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ source: "bucket", word })
    );
    e.dataTransfer.effectAllowed = "copyMove";
  };

  return (
    <Box
      sx={{
        minHeight: "40px",
        width: "calc(50% - 4px)",
        p: 0.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "22px",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
          {length} chars
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          ({uniqueWords.length})
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "3px", overflow: "auto", maxHeight: "100px" }}>
        {uniqueWords.map((word, i) => {
          const used = usedWords.has(word);
          return (
            <Box
              key={i}
              draggable={!used}
              onDragStart={(e) => handleDragStart(e, word)}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1px",
                height: "22px",
                pl: 0.75,
                pr: used ? 0.75 : 0.25,
                borderRadius: "11px",
                fontSize: "0.7rem",
                backgroundColor: used ? "action.disabledBackground" : "default",
                border: "1px solid",
                borderColor: used ? "transparent" : "divider",
                cursor: used ? "default" : "grab",
                opacity: used ? 0.35 : 1,
                textDecoration: used ? "line-through" : "none",
                userSelect: "none",
                "&:active": used ? {} : { cursor: "grabbing" },
              }}
            >
              {word}
              {!used && (
                <CloseIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveWord(word);
                  }}
                  sx={{
                    fontSize: "12px",
                    cursor: "pointer",
                    color: "text.secondary",
                    "&:hover": { color: "error.main" },
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
