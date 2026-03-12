import { Box, Typography, Paper } from "@mui/material";

const isWordInTags = (word: string, currentTags: string[]): boolean =>
  currentTags.some((sentence) => sentence.split(/\s+/).includes(word));

export function CharBucket({
  words,
  length,
  currentTags,
}: {
  words: string[];
  length: string;
  currentTags: string[];
}) {
  const uniqueWords = Array.from(new Set(words));

  if (!uniqueWords.length) return null;

  return (
    <Paper
      elevation={1}
      sx={{
        backgroundColor: "action.hover",
        height: "130px",
        width: "calc(50% - 4px)",
        borderRadius: "4px",
        p: 0.75,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          height: "22px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
          {length} chars
        </Typography>
        <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
          ({uniqueWords.length})
        </Typography>
      </Box>
      <Box sx={{ overflow: "auto", height: "calc(100% - 22px)" }}>
        {uniqueWords.map((word, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              fontSize: "0.75rem",
              textDecoration: isWordInTags(word, currentTags)
                ? "line-through"
                : "none",
            }}
          >
            {word}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
