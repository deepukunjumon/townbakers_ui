import React, { useEffect, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import format from "date-fns/format";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import TableComponent from "../../components/TableComponent";
import DateSelector from "../../components/DateSelector";
import ExportMenu from "../../components/ExportMenu";

const ViewStocks = () => {
  const [date, setDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleExportClick = (eventOrType) => {
    if (typeof eventOrType === "string") {
      handleExport(eventOrType);
    } else {
      setAnchorEl(eventOrType.currentTarget);
    }
  };

  const handleExportClose = () => setAnchorEl(null);

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
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(`${apiConfig.BASE_URL}/stocks/summary`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
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
        setStockData([]);
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Error fetching stocks",
        });
      }
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [date]);

  const columns = [
    { field: "item_name", headerName: "Item", flex: 2 },
    { field: "total_quantity", headerName: "Total Quantity", flex: 1 },
  ];

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Stock Summary
      </Typography>

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Box display="flex" gap={2} my={2} alignItems="center">
        <DateSelector date={date} setDate={setDate} />
        <Button variant="outlined" onClick={fetchStocks}>
          Refresh
        </Button>
        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
        />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableComponent
          rows={stockData}
          columns={columns}
          rowIdField="item_name"
        />
      )}
    </Box>
  );
};

export default ViewStocks;
