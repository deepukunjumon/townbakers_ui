import React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const TimePickerComponent = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  fullWidth = true,
  error = false,
  helperText = "",
  sx = {},
  ...props
}) => {
  const handleTimeChange = (newValue) => {
    const formattedTime = newValue
      ? newValue.toTimeString().substring(0, 5)
      : "";
    onChange(formattedTime);
  };

  const timeValue = value ? new Date(`1970-01-01T${value}`) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <TimePicker
        label={label}
        value={timeValue}
        onChange={handleTimeChange}
        ampm={false} // 24-hour format
        slotProps={{
          textField: {
            fullWidth,
            required,
            disabled,
            error,
            helperText,
            placeholder: "HH:MM",
            sx: {
              borderRadius: 2,
              "& .MuiInputBase-root": {
                height: 48,
                borderRadius: 2,
                fontSize: "0.95rem",
              },
              ...sx,
            },
          },
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default TimePickerComponent;
