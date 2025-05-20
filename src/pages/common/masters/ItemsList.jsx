import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Divider,
    Switch,
} from "@mui/material";
import TableComponent from "../../../components/TableComponent";
import Loader from "../../../components/Loader";
import SnackbarAlert from "../../../components/SnackbarAlert";
import apiConfig from "../../../config/apiConfig";
import SearchFieldComponent from "../../../components/SearchFieldComponent";

const ItemsList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [snack, setSnack] = useState({
        open: false,
        severity: "error",
        message: "",
    });
    const controllerRef = useRef(null);
    const [dataReady, setDataReady] = useState(false);

    const fetchItems = useCallback(
        async (q = "", page = pagination.current_page, perPage = pagination.per_page) => {
            if (controllerRef.current) {
                controllerRef.current.abort();
            }
            const token = localStorage.getItem("token");
            const newController = new AbortController();
            controllerRef.current = newController;

            setLoading(true);
            setDataReady(false);

            try {
                const params = new URLSearchParams({
                    page,
                    per_page: perPage,
                    q: q.trim(),
                }).toString();

                const res = await fetch(
                    `${apiConfig.ITEMS_LIST}?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: newController.signal,
                    }
                );

                const data = await res.json();

                if (res.ok && data.success) {
                    setItems(data.items || []);
                    setPagination((prev) => ({
                        ...prev,
                        total: data.pagination?.total || 0,
                        current_page: data.pagination?.current_page || page,
                        per_page: data.pagination?.per_page || perPage,
                    }));
                    setDataReady(true);
                } else {
                    throw new Error(data.message || "Failed to load data");
                }
            } catch (error) {
                if (error.name !== "AbortError") {
                    setSnack({
                        open: true,
                        severity: "error",
                        message: error.message || "Failed to load data",
                    });
                }
                setDataReady(true);
            } finally {
                setLoading(false);
            }
        },
        [pagination.current_page, pagination.per_page]
    );

    useEffect(() => {
        fetchItems(searchTerm, pagination.current_page, pagination.per_page);
    }, [searchTerm, pagination.current_page, pagination.per_page, fetchItems]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handlePaginationChange = ({ page, rowsPerPage }) => {
        setPagination((prev) => ({
            ...prev,
            current_page: page,
            per_page: rowsPerPage,
        }));
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const token = localStorage.getItem("token");
        const newStatus = currentStatus === 1 ? 0 : 1;

        setLoading(true);

        try {
            const res = await fetch(`${apiConfig.UPDATE_ITEM_STATUS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to update status');
            }

            setItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === id ? { ...item, status: newStatus } : item
                )
            );

            setSnack({
                open: true,
                severity: "success",
                message: "Status updated successfully",
            });
        } catch (error) {
            setSnack({
                open: true,
                severity: "error",
                message: error.message || "Failed to update status",
            });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            field: "name",
            headerName: "Item",
            width: 400,
            headerAlign: "left",
            align: "left",
        },
        {
            field: "status",
            headerName: "Status",
            width: 150,
            headerAlign: "right",
            align: "right",
            renderCell: (params) => (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <Switch
                        checked={params.row.status === 1}
                        onChange={() => handleToggleStatus(params.row.id, params.row.status)}
                        color="primary"
                        inputProps={{ "aria-label": "status toggle" }}
                    />
                </div>
            ),
        },
    ];


    const showLoader = loading || !dataReady;

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Items List
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    maxWidth: 1200,
                    width: "100%",
                }}
            >
                <Box sx={{ width: 300 }}>
                    <SearchFieldComponent
                        label="Search"
                        placeholder="Search items..."
                        onSearch={handleSearch}
                        delay={0}
                        size="small"
                    />
                </Box>
            </Box>

            <SnackbarAlert
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                severity={snack.severity}
                message={snack.message}
            />

            <Box sx={{ position: "relative" }}>
                {showLoader ? (
                    <Loader message="Loading..." />
                ) : (
                    <TableComponent
                        rows={items}
                        columns={columns}
                        total={pagination.total}
                        page={pagination.current_page - 1}
                        rowsPerPage={pagination.per_page}
                        onPaginationChange={handlePaginationChange}
                    />
                )}
            </Box>
        </Box>
    );
};

export default ItemsList;
