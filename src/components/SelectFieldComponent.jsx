import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const SelectFieldComponent = ({
  label,
  value,
  onChange,
  options = [],
  valueKey = "id",
  displayKey = "",
  required = false,
  fullWidth = true,
  submitted = false,
  sx = {},
}) => {
  const showError = submitted && required && !value;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option?.[displayKey] || ""}
      isOptionEqualToValue={(option, value) =>
        option?.[valueKey] === value?.[valueKey]
      }
      value={value || null}
      onChange={(event, newValue) => {
        onChange({
          target: { name: label, value: newValue },
        });
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          fullWidth={fullWidth}
          error={showError}
          helperText={showError ? "This field is required" : ""}
        />
      )}
      sx={sx}
    />
  );
};

export default SelectFieldComponent;
