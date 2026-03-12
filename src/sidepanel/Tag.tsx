import { ChangeEvent } from "react";
import { Box, TextField, Typography } from "@mui/material";

export function Tag({
  tag,
  tagIndex,
  onChange,
}: {
  tag: string;
  tagIndex: number;
  onChange: (e: ChangeEvent<HTMLInputElement>, tagIndex: number) => void;
}) {
  const charsLeft = 20 - tag.length;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 0.5,
        gap: 0.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", width: "24px", textAlign: "right", flexShrink: 0 }}
      >
        {tagIndex + 1}
      </Typography>
      <TextField
        variant="outlined"
        size="small"
        fullWidth
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, tagIndex)}
        value={tag}
        color={tag.length <= 20 ? "success" : "error"}
        inputProps={{ maxLength: 30 }}
        sx={{
          "& .MuiInputBase-input": { py: 0.6, fontSize: "0.85rem" },
        }}
      />
      <Typography
        variant="body2"
        sx={{
          width: "52px",
          textAlign: "right",
          flexShrink: 0,
          color: charsLeft < 0 ? "error.main" : "text.secondary",
          fontSize: "0.75rem",
        }}
      >
        {charsLeft}
      </Typography>
    </Box>
  );
}
