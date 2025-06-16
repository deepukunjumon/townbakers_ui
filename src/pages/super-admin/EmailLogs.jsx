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

const EmailLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState({
        id: "",
        name: "All Status",
    });
    const [statusOptions] = useState([
        { id: "", name: "All Status" },
        { id: "pending", name: "Pending" },
        { id: "sent", name: "Sent" },
        { id: "failed", name: "Failed" },
    ]);
    const [typeFilter, setTypeFilter] = useState({
        value: "",
        label: "All Types",
    });
    const [typeOptions, setTypeOptions] = useState([
        { id: "", name: "All Types" },
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

    const fetchTypeOptions = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${apiConfig.SUPER_ADMIN.EMAIL_LOG_TYPES}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                setTypeOptions([{ id: "", name: "All Types" }, ...data.types]);
            } else {
                throw new Error(data.message || "Failed to fetch email types");
            }
        } catch (error) {
            setSnack({
                open: true,
                severity: "error",
                message: error.message || "Failed to load email types",
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
            if (statusFilter?.id) params.append("status", statusFilter.id);
            if (typeFilter?.value) params.append("type", typeFilter.value);
            if (startDate)
                params.append("start_date", format(startDate, "yyyy-MM-dd"));
            if (endDate) params.append("end_date", format(endDate, "yyyy-MM-dd"));

            const response = await fetch(
                `${apiConfig.SUPER_ADMIN.EMAIL_LOGS}?${params.toString()}`,
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
                throw new Error(data.message || "Failed to fetch Email Logs");
            }
        } catch (error) {
            setSnack({
                open: true,
                severity: "error",
                message: error.message || "Failed to load Email Logs",
            });
        } finally {
            setLoading(false);
        }
    }, [
        pagination.current_page,
        pagination.per_page,
        searchTerm,
        statusFilter,
        typeFilter,
        startDate,
        endDate,
    ]);

    useEffect(() => {
        fetchTypeOptions();
    }, [fetchTypeOptions]);

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
            field: "type",
            headerName: "Type",
            flex: 1,
            renderCell: (params) => {
                const value = params.value?.toLowerCase();
                const colorMap = {
                    order_delivery: "success",
                    order_confirmation: "info",
                    order_cancellation: "error",
                };

                const label = params.value
                    ? params.value.split('_').map(word =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')
                    : "Unknown";

                return (
                    <ChipComponent
                        label={label}
                        color={colorMap[value] || "default"}
                        size="small"
                    />
                );
            },
        },
        { field: "to", headerName: "To", flex: 1 },
        { field: "cc", headerName: "CC", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => {
                const value = params.value?.toLowerCase();
                const colorMap = {
                    pending: "warning",
                    sent: "success",
                    failed: "error",
                };

                const label = params.value
                    ? params.value.charAt(0).toUpperCase() + params.value.slice(1)
                    : "Unknown";

                return (
                    <ChipComponent
                        label={label}
                        color={colorMap[value] || "default"}
                        size="small"
                    />
                );
            },
        },
        { field: "error_message", headerName: "Error Message", flex: 2 },
        {
            field: "created_at",
            headerName: "Sent On",
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
            <Typography variant="h5">Email Logs</Typography>
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
                            label="Type"
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(
                                    e.target.value || { value: "", label: "All Types" }
                                );
                                setPagination((prev) => ({ ...prev, current_page: 1 }));
                            }}
                            options={typeOptions}
                            valueKey="value"
                            displayKey="label"
                            fullWidth
                        />
                    </Box>

                    <Box sx={{ width: { xs: 166, sm: 200 } }}>
                        <SelectFieldComponent
                            label="Status"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(
                                    e.target.value || { id: "", name: "All Status" }
                                );
                                setPagination((prev) => ({ ...prev, current_page: 1 }));
                            }}
                            options={statusOptions}
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

export default EmailLogs;
