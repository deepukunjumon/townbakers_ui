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
import Loader from "../../components/Loader";
import axios from "axios";

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
  const [loading, setLoading] = useState(false);
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
    form.action = `${apiConfig.BRANCHWISE_STOCK_SUMMARY}`;

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const token = localStorage.getItem("token");
    if (token) addField("token", token);

    // FIX: Always pass branch_id as string
    const branchIdValue =
      typeof branchId === "object" && branchId !== null
        ? branchId.id
        : branchId;
    addField("branch_id", branchIdValue);
    addField("date", formattedDate);
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
        const res = await fetch(`${apiConfig.MINIMAL_BRANCHES}`, {
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
    setLoading(true);
    try {
      const res = await axios.post(
        apiConfig.BRANCHWISE_STOCK_SUMMARY,
        {
          branch_id: branchId,
          date: format(date, "yyyy-MM-dd"),
          page: pagination.current_page,
          per_page: pagination.per_page,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
        }
      );
      const data = res.data;
      if (Array.isArray(data.data)) {
        const flatData =
          data.data[0]?.items?.map((item) => ({
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
          message: data.message,
        });
      } else throw new Error();
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load stock summary",
      });
    } finally {
      setLoading(false);
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
    <Box sx={{ maxWidth: "auto", p: 3 }}>
      {loading && <Loader message="Loading..." />}
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack({ ...snack, open: false })}
        severity={snack.severity}
        message={snack.message}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ maxWidth: "auto" }}
      >
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

      <Box
        display="flex"
        gap={2}
        alignItems="center"
        my={2}
        flexWrap="wrap"
        sx={{
          "& > *": {
            flex: { xs: "1 1 100%", sm: "1 1 auto" },
          },
        }}
      >
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
          sx={{
            maxWidth: { xs: "100%", sm: 300 },
          }}
        />

        <Box display="flex" gap={2}>
          <DateSelectorComponent
            required
            label="Select Date"
            sx={{
              maxWidth: { xs: 200, sm: "100%" },
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
            sx={{
              width: { xs: "100%", sm: "fit-content" },
              alignSelf: { xs: "stretch", sm: "flex-end" },
            }}
          >
            SUBMIT
          </ButtonComponent>
        </Box>
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
