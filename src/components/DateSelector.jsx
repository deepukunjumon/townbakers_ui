import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Box } from "@mui/material";

const DateSelector = ({ date, setDate, label = "Select Date" }) => (
  <Box sx={{ width: 200 }}>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={date}
        format="dd-MM-yyyy"
        onChange={setDate}
        maxDate={new Date()}
        slotProps={{ textField: { fullWidth: true } }}
      />
    </LocalizationProvider>
  </Box>
);

export default DateSelector;
