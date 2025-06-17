import React, { useEffect, useState, useRef, useCallback } from "react";
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
import TextFieldComponent from "../../components/TextFieldComponent";

const ViewBranchStockSummary = () => {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [date, setDate] = useState("");
  const [rows, setRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);
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
    form.method = "GET";
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

  const fetchSummary = useCallback(async () => {
    if (!branchId || !date) return;
    setLoading(true);
    try {
      const branchIdValue =
        typeof branchId === "object" ? branchId.id : branchId;

      const res = await axios.get(apiConfig.BRANCHWISE_STOCK_SUMMARY, {
        params: {
          branch_id: branchIdValue,
          date: format(date, "yyyy-MM-dd"),
          page: pagination.current_page,
          per_page: pagination.per_page,
          q: searchTerm.trim(),
        },
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

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
    } catch (error) {
      console.error("Error fetching stock summary:", error);
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load stock summary",
      });
    } finally {
      setLoading(false);
    }
  }, [
    branchId,
    date,
    pagination.current_page,
    pagination.per_page,
    searchTerm,
  ]);
  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  };

  useEffect(() => {
    if (submitted && branchId && date) {
      fetchSummary();
    }
  }, [fetchSummary, submitted, branchId, date]);

  const handleSubmit = () => {
    setSubmitted(true);
    fetchSummary();
  };

  const columns = [
    { field: "item_name", headerName: "Item" },
    { field: "quantity", headerName: "Quantity" },
  ];

  return (
    <Box sx={{ maxWidth: "auto" }}>
      {loading && <Loader message="Loading..." />}
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
        <Box
          display="flex"
          gap={2}
          alignItems="center"
          flexWrap="wrap"
          sx={{
            flex: { xs: "1 1 100%", sm: "1 1 auto" },
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

          <Box display="flex" gap={2} alignItems="center">
            <DateSelectorComponent
              required
              label="Select Date"
              sx={{
                maxWidth: { xs: "95%", sm: "100%" },
              }}
              date={date}
              onChange={(newDate) => setDate(newDate)}
              error={submitted && !date}
              helperText={submitted && !date ? "Date is required" : ""}
              maxDate={new Date()}
            />

            <ButtonComponent
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              sx={{
                ml: { xs: -2, sm: 0 },
                width: "auto",
                minWidth: "100px",
                height: "54px",
              }}
            >
              Generate
            </ButtonComponent>
          </Box>
        </Box>

        {rows.length > 0 && (
          <Box sx={{ width: { xs: "100%", sm: 0 } }}>
            <TextFieldComponent
              label="Search"
              variant="outlined"
              onChange={handleSearchChange}
              placeholder="Search items..."
            />
          </Box>
        )}
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
