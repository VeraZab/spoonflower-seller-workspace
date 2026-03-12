import { useState } from "react";
import { Box, Paper, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

export function CopyPasteText({
  text,
  tooltipText,
  compact,
}: {
  text: string;
  tooltipText?: string;
  compact?: boolean;
}) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  return (
    <Paper
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        p: compact ? 1 : 1.5,
        borderRadius: "4px",
        justifyContent: "space-between",
        backgroundColor: "action.hover",
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          wordBreak: "break-word",
          flex: 1,
          fontSize: compact ? "0.7rem" : "0.8rem",
          fontFamily: compact ? "monospace" : "inherit",
        }}
      >
        {text}
      </Typography>
      <Tooltip title={tooltipText || "Copy to Clipboard"}>
        {copiedToClipboard ? (
          <CheckIcon sx={{ fontSize: 18, color: "success.main", flexShrink: 0 }} />
        ) : (
          <ContentCopyIcon
            sx={{ fontSize: 18, cursor: "pointer", flexShrink: 0 }}
            onClick={() => {
              if (text.trim() !== "") {
                navigator.clipboard.writeText(text).then(() => {
                  setCopiedToClipboard(true);
                  setTimeout(() => setCopiedToClipboard(false), 2000);
                });
              }
            }}
          />
        )}
      </Tooltip>
    </Paper>
  );
}
