import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const SelectFieldComponent = ({
  label,
  value,
  onChange,
  options = [],
  valueKey = "id",
  displayKey = "name",
  required = false,
  fullWidth = true,
  margin = "normal",
}) => {
  const getOptionLabel = (option) =>
    typeof option === "string" ? option : option[displayKey] || "";

  const getOptionSelected = (option, val) => option[valueKey] === val[valueKey];

  return (
    <Autocomplete
      options={options}
      getOptionLabel={getOptionLabel}
      value={options.find((opt) => opt[valueKey] === value) || null}
      isOptionEqualToValue={(option, val) => option[valueKey] === val[valueKey]}
      onChange={(event, newValue) =>
        onChange({
          target: {
            value: newValue ? newValue[valueKey] : "",
            name: label,
          },
        })
      }
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          margin={margin}
        />
      )}
    />
  );
};

export default SelectFieldComponent;
