import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Box } from "@mui/material";

const DateSelectorComponent = ({
  label = "Select Date",
  value,
  onChange,
  name,
  minDate,
  maxDate,
  required = false,
  submitted = false,
  sx = {},
}) => {
  const showError = submitted && required && !value;

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={value}
          onChange={(newValue) => {
            if (onChange) {
              onChange(newValue, name);
            }
          }}
          minDate={minDate}
          maxDate={maxDate}
          format="dd-MM-yyyy"
          slotProps={{
            textField: {
              fullWidth: true,
              required,
              error: showError,
              helperText: showError ? "This field is required" : "",
              sx: {
                ...sx,
              },
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateSelectorComponent;
