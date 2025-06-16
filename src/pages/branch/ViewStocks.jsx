import React, { useEffect, useState, useCallback } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import format from "date-fns/format";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import apiConfig from "../../config/apiConfig";
import TableComponent from "../../components/TableComponent";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import ExportMenu from "../../components/ExportMenu";
import { getToken } from "../../utils/auth";

const ViewStocks = () => {
  const [date, setDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
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
    form.action = `${apiConfig.STOCK_SUMMARY}`;

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

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(
        `${apiConfig.STOCK_SUMMARY}?page=${pagination.current_page}&per_page=${pagination.per_page}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({ date: formattedDate }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStockData(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
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
  }, [date, pagination.current_page, pagination.per_page]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    setStockData([]);
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleRefresh = () => {
    fetchStocks();
  };

  const columns = [
    { field: "item_name", headerName: "Item", flex: 2 },
    {
      field: "total_quantity",
      headerName: "Total Quantity",
      flex: 1,
      align: 'right',
      headerAlign: 'right'
    },
  ];

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2
      }}>
        <Typography variant="h5">
          Stock Summary
        </Typography>
        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
          disabled={stockData.length === 0}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Box display="flex" gap={2} my={2} alignItems="center">
        <DateSelectorComponent
          sx={{ width: { xs: 200, sm: "100%" } }}
          value={date}
          maxDate={new Date()}
          onChange={handleDateChange}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRefresh}
          sx={{
            minWidth: 120,
          }}
        >
          Generate
        </Button>
      </Box>

      {loading && <Loader message="Loading..." />}

      {!loading && (
        <TableComponent
          rows={stockData}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </Box>
  );
};

export default ViewStocks;
