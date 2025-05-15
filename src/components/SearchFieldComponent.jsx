import React, { useEffect, useState } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import TextFieldComponent from "./TextFieldComponent";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchFieldComponent = ({
  label = "Search",
  onDebouncedChange,
  delay = 300,
}) => {
  const [input, setInput] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(input);
    }, delay);
    return () => clearTimeout(handler);
  }, [input, delay]);

  useEffect(() => {
    onDebouncedChange?.(debouncedValue);
  }, [debouncedValue, onDebouncedChange]);

  const handleClear = () => {
    setInput("");
    setDebouncedValue("");
  };

  return (
    <TextFieldComponent
      label={label}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      size="small"
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {input ? (
              <IconButton onClick={handleClear} size="small">
                <ClearIcon />
              </IconButton>
            ) : (
              <SearchIcon color="action" />
            )}
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchFieldComponent;
