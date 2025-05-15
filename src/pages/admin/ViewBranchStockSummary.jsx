import React, { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import TableComponent from "../../components/TableComponent";
import ExportMenu from "../../components/ExportMenu";
import ButtonComponent from "../../components/ButtonComponent";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import { format } from "date-fns";
import SelectFieldComponent from "../../components/SelectFieldComponent";

const ViewBranchStockSummary = () => {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
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
  const [submitted, setSubmitted] = useState(false);
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
    form.action = `${apiConfig.BASE_URL}/admin/branchwise/stock/summary`;

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
    addField("branch_id", branchId);
    addField("export", "true");
    addField("type", type);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    handleExportClose();
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${apiConfig.BASE_URL}/branches/minimal`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setBranches(data.branches || data.data || []);
        else throw new Error();
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
    setSubmitted(true);
    if (!branchId || !date) return;
    try {
      const res = await fetch(
        `${apiConfig.BASE_URL}/admin/branchwise/stock/summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({
            branch_id: branchId,
            date: format(date, "yyyy-MM-dd"),
            page: pagination.current_page,
            per_page: pagination.per_page,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        const flatData =
          data.data[0]?.items?.map((item, idx) => ({
            item_name: item.item_name || item.item_id,
            quantity: item.quantity,
          })) || [];
        setRows(flatData);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Data fetched",
        });
      } else throw new Error();
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load stock summary",
      });
    }
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
    fetchSummary();
  };

  const columns = [
    { field: "item_name", headerName: "Item" },
    { field: "quantity", headerName: "Quantity" },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        severity={snack.severity}
        message={snack.message}
      />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Branch-wise Stock Summary</Typography>
        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
          disabled={rows.length === 0}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <Box display="flex" gap={2} alignItems="center" my={2} flexWrap="wrap">
        <SelectFieldComponent
          label="Select Branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          options={branches}
          valueKey="id"
          displayKey={(branch) =>
            `${branch.branche_code || branch.code} - ${branch.name}`
          }
          required
          fullWidth
          sx={{ minWidth: 250 }}
        />

        <DateSelectorComponent
          required
          label="Select Date"
          sx={{
            maxWidth: { xs: 185, md: 320 },
          }}
          date={date}
          onChange={(newDate) => setDate(newDate)}
          error={submitted && !date}
          helperText={submitted && !date ? "Date is required" : ""}
          maxDate={new Date()}
        />
        <ButtonComponent
          onClick={fetchSummary}
          variant="contained"
          color="primary"
        >
          SUBMIT
        </ButtonComponent>
      </Box>

      {rows.length > 0 && (
        <TableComponent
          rows={rows}
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

export default ViewBranchStockSummary;
