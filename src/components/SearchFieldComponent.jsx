import React, { useState, useEffect, useRef } from "react";
import { TextField } from "@mui/material";

const SearchFieldComponent = ({
  label = "Search",
  onSearch,
  delay = 500,
  placeholder = "",
  fullWidth = true,
  sx = {},
}) => {
  const [inputValue, setInputValue] = useState("");
  const debounceTimeout = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      onSearch(val.trim());
    }, delay);
  };

  return (
    <TextField
      label={label}
      variant="outlined"
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      sx={sx}
    />
  );
};

export default SearchFieldComponent;
