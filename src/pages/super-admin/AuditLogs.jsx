import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Divider, Grid } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ChipComponent from "../../components/ChipComponent";
import apiConfig from "../../config/apiConfig";
import { format, startOfMonth, endOfMonth } from "date-fns";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState({
    id: "",
    name: "All Actions",
  });
  const [actionOptions, setActionOptions] = useState([
    { id: "", name: "All Actions" },
  ]);
  const [tableFilter, setTableFilter] = useState({
    id: "",
    name: "All Tables",
  });
  const [tableOptions, setTableOptions] = useState([
    { id: "", name: "All Tables" },
  ]);
  const [startDate, setStartDate] = useState(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState(endOfMonth(new Date()));
  const searchTimeout = useRef(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });

  const fetchActionOptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(apiConfig.SUPER_ADMIN.AUDIT_LOG_ACTIONS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setActionOptions([{ id: "", name: "All Actions" }, ...data.actions]);
      } else {
        throw new Error(data.message || "Failed to fetch action options");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to load action options",
      });
    }
  }, []);

  const fetchTableOptions = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiConfig.SUPER_ADMIN.TABLES_LIST}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setTableOptions([{ id: "", name: "All Tables" }, ...data.tables]);
      } else {
        throw new Error(data.message || "Failed to fetch table options");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to load table options",
      });
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
      });

      if (searchTerm) params.append("q", searchTerm);
      if (actionFilter?.id) params.append("action", actionFilter.id);
      if (tableFilter?.id) params.append("table", tableFilter.id);
      if (startDate)
        params.append("start_date", format(startDate, "yyyy-MM-dd"));
      if (endDate) params.append("end_date", format(endDate, "yyyy-MM-dd"));

      const response = await fetch(
        `${apiConfig.SUPER_ADMIN.AUDIT_LOGS}?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
      } else {
        throw new Error(data.message || "Failed to fetch audit logs");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to load audit logs",
      });
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    searchTerm,
    actionFilter,
    tableFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchActionOptions();
  }, [fetchActionOptions]);

  useEffect(() => {
    fetchTableOptions();
  }, [fetchTableOptions]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 500);
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const columns = [
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      renderCell: (params) => {
        const value = params.value?.toLowerCase();
        const colorMap = {
          create: "success",
          update: "info",
          delete: "error",
          import: "info",
          enable: "success",
          disable: "warning",
          complete: "success",
          cancel: "error"
        };

        const properCase = value
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : "Unknown";

        return (
          <ChipComponent
            label={properCase}
            color={colorMap[value] || "default"}
            size="small"
          />
        );
      },
    },
    { field: "table", headerName: "Table", flex: 1 },
    { field: "record_id", headerName: "Record ID", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "performed_by",
      headerName: "Performed By",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2">{params.value.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            {params.value.role}
          </Typography>
        </Box>
      ),
    },
    {
      field: "created_at",
      headerName: "Performed On",
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {format(new Date(params.value), "dd/MM/yyyy HH:mm:ss")}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: "auto" }} >
      <Typography variant="h5">Audit Logs</Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ width: { xs: 166, sm: 200 } }}>
            <SelectFieldComponent
              label="Table"
              value={tableFilter}
              onChange={(e) => {
                setTableFilter(
                  e.target.value || { id: "", name: "All Tables" }
                );
                setPagination((prev) => ({ ...prev, current_page: 1 }));
              }}
              options={tableOptions}
              valueKey="id"
              displayKey="name"
              fullWidth
            />
          </Box>

          <Box sx={{ width: { xs: 166, sm: 200 } }}>
            <SelectFieldComponent
              label="Action"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(
                  e.target.value || { id: "", name: "All Actions" }
                );
                setPagination((prev) => ({ ...prev, current_page: 1 }));
              }}
              options={actionOptions}
              valueKey="id"
              displayKey="name"
              fullWidth
            />
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <DateSelectorComponent
                label="Start Date"
                value={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                sx={{ width: { xs: 166, sm: 177, md: 180 } }}
                maxDate={endDate || new Date()}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <DateSelectorComponent
                label="End Date"
                value={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
                sx={{ width: { xs: 166, sm: 177, md: 180 } }}
                minDate={startDate}
                maxDate={new Date()}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ width: { xs: "100%", md: 300 } }}>
          <TextFieldComponent
            label="Search"
            variant="outlined"
            fullWidth
            onChange={handleSearchChange}
            placeholder="Search in logs..."
          />
        </Box>
      </Box>

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      {loading ? (
        <Loader message="Loading..." />
      ) : (
        <TableComponent
          rows={logs}
          columns={columns}
          rowIdField="id"
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </Box >
  );
};

export default AuditLogs;
