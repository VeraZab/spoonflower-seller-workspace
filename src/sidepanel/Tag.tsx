import { useState, useRef, useEffect, DragEvent, KeyboardEvent } from "react";
import { Box, Typography, TextField, ClickAwayListener } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface DragData {
  source: "bucket" | "tag";
  word: string;
  tagIndex?: number;
  wordIndex?: number;
}

export function Tag({
  words,
  tagIndex,
  onAddWord,
  onRemoveWord,
  onReorder,
  onMoveWord,
  onEditWord,
}: {
  words: string[];
  tagIndex: number;
  onAddWord: (tagIndex: number, word: string) => void;
  onRemoveWord: (tagIndex: number, wordIndex: number) => void;
  onReorder: (tagIndex: number, fromIdx: number, toIdx: number) => void;
  onMoveWord: (fromTag: number, wordIdx: number, toTag: number) => void;
  onEditWord: (tagIndex: number, wordIndex: number, newWord: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [inlineText, setInlineText] = useState("");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingIdx !== null && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingIdx]);

  const tagString = words.join(" ");
  const pendingString = inlineText.trim()
    ? (tagString ? `${tagString} ${inlineText.trim()}` : inlineText.trim())
    : tagString;
  const reserveSpace = pendingString.length > 0 && pendingString.length < 20 ? 1 : 0;
  const charsLeft = 20 - pendingString.length - reserveSpace;

  const parseDragData = (e: DragEvent): DragData | null => {
    try {
      return JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return null;
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const data = parseDragData(e);
    if (!data) return;

    if (data.source === "bucket") {
      onAddWord(tagIndex, data.word);
    } else if (data.source === "tag" && data.tagIndex !== undefined && data.wordIndex !== undefined) {
      if (data.tagIndex === tagIndex) {
        onReorder(tagIndex, data.wordIndex, words.length);
      } else {
        onMoveWord(data.tagIndex, data.wordIndex, tagIndex);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleChipDragStart = (e: DragEvent<HTMLDivElement>, wordIndex: number) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        source: "tag",
        word: words[wordIndex],
        tagIndex,
        wordIndex,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const commitEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editText.trim();
    if (trimmed && trimmed !== words[editingIdx]) {
      onEditWord(tagIndex, editingIdx, trimmed);
    }
    setEditingIdx(null);
    setEditText("");
  };

  const handleInlineKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inlineText.trim()) {
      e.preventDefault();
      inlineText.trim().split(/\s+/).forEach((w) => onAddWord(tagIndex, w));
      setInlineText("");
    }
  };

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
        sx={{ fontWeight: "bold", width: "20px", textAlign: "right", flexShrink: 0, fontSize: "0.75rem" }}
      >
        {tagIndex + 1}
      </Typography>

      <Box
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          height: "32px",
          overflow: "hidden",
          border: "2px solid",
          borderColor: isDragOver ? "primary.main" : "divider",
          borderRadius: "4px",
          px: 0.5,
          py: 0.25,
          backgroundColor: isDragOver ? "action.selected" : "transparent",
          transition: "border-color 0.15s, background-color 0.15s",
        }}
      >
        {words.map((word, wi) =>
          editingIdx === wi ? (
            <ClickAwayListener key={wi} onClickAway={commitEdit}>
              <input
                ref={editRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value.toLowerCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitEdit();
                  if (e.key === "Escape") { setEditingIdx(null); setEditText(""); }
                }}
                style={{
                  width: `${Math.max(editText.length, 2) + 1}ch`,
                  height: "22px",
                  fontSize: "0.7rem",
                  border: "2px solid",
                  borderColor: "#1976d2",
                  borderRadius: "11px",
                  padding: "0 6px",
                  outline: "none",
                  background: "transparent",
                }}
              />
            </ClickAwayListener>
          ) : (
            <Box
              key={wi}
              draggable
              onDragStart={(e) => handleChipDragStart(e, wi)}
              onDoubleClick={() => { setEditingIdx(wi); setEditText(word); }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: "2px",
                height: "22px",
                pl: 0.75,
                pr: 0.25,
                borderRadius: "11px",
                fontSize: "0.7rem",
                backgroundColor: "action.selected",
                border: "1px solid",
                borderColor: "divider",
                cursor: "grab",
                userSelect: "none",
                "&:active": { cursor: "grabbing" },
              }}
            >
              {word}
              <CloseIcon
                onClick={() => onRemoveWord(tagIndex, wi)}
                sx={{
                  fontSize: "14px",
                  cursor: "pointer",
                  borderRadius: "50%",
                  color: "text.secondary",
                  "&:hover": { color: "error.main", backgroundColor: "action.hover" },
                }}
              />
            </Box>
          )
        )}

        <TextField
          variant="standard"
          size="small"
          placeholder={words.length === 0 ? "type or drop" : "+"}
          value={inlineText}
          onChange={(e) => setInlineText(e.target.value.toLowerCase())}
          onKeyDown={handleInlineKeyDown}
          InputProps={{ disableUnderline: true }}
          sx={{
            flex: 1,
            minWidth: words.length === 0 ? "50px" : "24px",
            "& .MuiInputBase-input": {
              py: 0.25,
              fontSize: "0.75rem",
            },
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          width: "40px",
          textAlign: "right",
          flexShrink: 0,
          color: charsLeft < 0 ? "error.main" : "text.secondary",
          fontSize: "0.7rem",
        }}
      >
        {charsLeft}
      </Typography>
    </Box>
  );
}
