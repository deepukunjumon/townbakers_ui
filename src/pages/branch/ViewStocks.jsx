import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExport = (type) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${apiConfig.BASE_URL}/stocks/summary`;

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const token = localStorage.getItem("token");
    if (token) addField("token", token);

    addField("date", formattedDate);
    addField("export", "true");
    addField("type", type);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    handleExportClose();
  };

  const fetchStocks = async () => {
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(`${apiConfig.BASE_URL}/stocks/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // standard secure method
        },
        body: JSON.stringify({ date: formattedDate }),
      });

      const data = await res.json();
      if (res.ok) {
        setStockData(data.data || []);
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Stock summary loaded",
        });
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Error fetching stocks",
        });
        setStockData([]);
      }
    } catch (err) {
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
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
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

        <IconButton onClick={handleExportClick}>
          <MoreVertIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleExportClose}>
          <MenuItem onClick={() => handleExport("excel")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleExport("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <TableComponent columns={columns} rows={stockData} />
    </Box>
  );
};

export default ViewStocks;
