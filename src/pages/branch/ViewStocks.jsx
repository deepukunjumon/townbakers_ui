// src/pages/branch/ViewStocks.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import format from "date-fns/format";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";

const ViewStocks = () => {
  const [date, setDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const fetchStocks = async () => {
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(
        `${apiConfig.BASE_URL}/stocks/summary?date=${formattedDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStockData(data.data || []);
        setSnack({ open: true, severity: "success", message: data.message });
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Error fetching stocks",
        });
        setStockData([]);
      }
    } catch {
      setSnack({ open: true, severity: "error", message: "Network error" });
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [date]);

  const columns = [
    { field: "item_name", headerName: "Item" },
    { field: "total_quantity", headerName: "Total Quantity" },
  ];

  return (
    <Box>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" gutterBottom>
        Stock Summary
      </Typography>

      <Box display="flex" gap={2} my={2} alignItems="center">
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Select Date"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            format="yyyy-MM-dd"
          />
        </LocalizationProvider>

        <Button variant="outlined" onClick={fetchStocks}>
          Refresh
        </Button>
      </Box>

      <TableComponent columns={columns} rows={stockData} />
    </Box>
  );
};

export default ViewStocks;
