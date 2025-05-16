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

  // Handle debounced value change after input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(input); // Set the debounced value after delay
    }, delay);

    return () => clearTimeout(handler); // Clear timeout if input changes before delay
  }, [input, delay]); // Dependency on input

  // Only call onDebouncedChange when debouncedValue changes
  useEffect(() => {
    if (debouncedValue !== input) {
      onDebouncedChange?.(debouncedValue); // Avoid calling if debouncedValue is the same as input
    }
  }, [debouncedValue, onDebouncedChange, input]); // Dependency on debouncedValue and input to ensure proper update flow

  const handleClear = () => {
    setInput(""); // Clear input state
    setDebouncedValue(""); // Clear debounced value
  };

  return (
    <TextFieldComponent
      label={label}
      value={input}
      onChange={(e) => setInput(e.target.value)} // Update input state
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
