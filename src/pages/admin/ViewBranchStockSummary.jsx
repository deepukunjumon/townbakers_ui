import React, { useEffect, useState } from "react";
import { Box, Typography, TextField, MenuItem, Button } from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import TableComponent from "../../components/TableComponent";
import apiConfig from "../../config/apiConfig";

const ViewBranchStockSummary = () => {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rows, setRows] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${apiConfig.BASE_URL}/branches/minimal`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (res.ok) {
          setBranches(data.branches || data.data || []);
        } else {
          throw new Error();
        }
      } catch {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load branches",
        });
      }
    };

    fetchBranches();
  }, []);

  const fetchSummary = async () => {
    if (!branchId || !date) return;

    try {
      const res = await fetch(
        `${apiConfig.BASE_URL}/admin/branchwise/stocks/summary?branch_id=${branchId}&date=${date}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      const data = await res.json();
      if (res.ok) {
        const flatData =
          data.data?.items?.map((item) => ({
            item_name: item.item_name || item.item_id,
            quantity: item.quantity,
          })) || [];
        setRows(flatData);
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Data fetched",
        });
      } else {
        throw new Error();
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load stock summary",
      });
    }
  };

  const columns = [
    { field: "item_name", headerName: "Item", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" gutterBottom>
        View Stock Summary (Branch-wise)
      </Typography>

      <Box display="flex" gap={2} alignItems="center" my={2} flexWrap="wrap">
        <TextField
          select
          label="Select Branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          fullWidth
          sx={{ minWidth: 250 }}
        >
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.branche_code || branch.code} - {branch.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Select Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button variant="contained" onClick={fetchSummary}>
          View Report
        </Button>
      </Box>

      {rows.length > 0 && <TableComponent rows={rows} columns={columns} />}
    </Box>
  );
};

export default ViewBranchStockSummary;
