import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Box, useMediaQuery, useTheme } from "@mui/material";

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [internalDate, setInternalDate] = useState(value);
  const showError = submitted && required && !value;

  useEffect(() => {
    setInternalDate(value);
  }, [value]);

  const handleChange = (newValue) => {
    setInternalDate(newValue);
    if (!isSmallScreen) {
      if (onChange) {
        onChange(newValue, name);
      }
    }
  };

  const handleAccept = (acceptedValue) => {
    if (isSmallScreen) {
      if (onChange) {
        onChange(acceptedValue, name);
      }
    }
  };

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label={label}
          value={internalDate}
          onChange={handleChange}
          onAccept={handleAccept}
          minDate={minDate}
          maxDate={maxDate}
          format="dd-MM-yyyy"
          closeOnSelect={!isSmallScreen}
          desktopModeMediaQuery="@media (pointer: fine)"
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
            actionBar: {
              actions: isSmallScreen ? ['cancel', 'accept'] : [],
              sx: {
                display: isSmallScreen ? 'flex' : 'none'
              }
            },
            mobilePaper: {
              sx: {
                '& .MuiPickersToolbar-root': {
                  display: 'none'
                }
              }
            }
          }}
        />
      </LocalizationProvider>
    </Box>
  );
};

export default DateSelectorComponent;
