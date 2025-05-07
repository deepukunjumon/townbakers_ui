import React from "react";
import { TextField, MenuItem } from "@mui/material";

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
  return (
    <TextField
      select
      label={label}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      margin={margin}
    >
      {options.length === 0 ? (
        <MenuItem disabled>Loading...</MenuItem>
      ) : (
        options.map((option) => (
          <MenuItem key={option[valueKey]} value={option[valueKey]}>
            {option[displayKey]}
          </MenuItem>
        ))
      )}
    </TextField>
  );
};

export default SelectFieldComponent;
