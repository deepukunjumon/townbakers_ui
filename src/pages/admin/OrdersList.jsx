import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Autocomplete,
} from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import { getToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import { format } from "date-fns";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import ModalComponent from "../../components/ModalComponent";
import Loader from "../../components/Loader";
import ChipComponent from "../../components/ChipComponent";
import { ORDER_STATUS_CONFIG } from "../../constants/statuses";

const OrdersList = () => {
  const currentDate = new Date();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const controllerRef = useRef(null);

  const fetchBranches = async () => {
    try {
      const token = getToken();
      const res = await fetch(apiConfig.MINIMAL_BRANCHES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setBranches([
          { id: "", code: "All", name: "Branches" },
          ...(data.branches || []),
        ]);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to load branches",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load branches",
      });
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      page: pagination.current_page,
      per_page: pagination.per_page,
      search,
      status: statusFilter,
      branch_id: branchFilter,
    });

    try {
      const res = await fetch(`${apiConfig.ALL_ORDERS}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setPagination((prev) => ({
          ...prev,
          current_page: data.pagination?.current_page || 1,
          last_page: data.pagination?.last_page || 1,
          per_page: data.pagination?.per_page || 10,
          total: data.pagination?.total || 0,
        }));
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to load orders",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load orders",
      });
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current_page,
    pagination.per_page,
    startDate,
    endDate,
    search,
    statusFilter,
    branchFilter,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleOrderClick = (orderId) => {
    setOpenModal(true);
    fetchOrderDetails(orderId);
  };

  const fetchOrderDetails = async (orderId) => {
    const controller = new AbortController();
    controllerRef.current = controller;

    setModalLoading(true);
    setSelectedOrder(null);

    try {
      const token = getToken();
      const res = await fetch(apiConfig.ORDER_DETAILS(orderId), {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      const data = await res.json();

      if (data.success && data.order) {
        setSelectedOrder(data.order);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Order details not found",
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to fetch order details",
        });
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedOrder(null);
    setModalLoading(false);
    if (controllerRef.current) controllerRef.current.abort();
  };

  const tableRows = orders.map((order) => ({
    id: order.id,
    title: order.title,
    delivery_date: order.delivery_date,
    total_amount: order.total_amount,
    customer_name: order.customer_name,
    customer_mobile: order.customer_mobile,
    status: (
      <ChipComponent
        label={
          ORDER_STATUS_CONFIG[order.status]?.label ||
          ORDER_STATUS_CONFIG.default.label
        }
        color={
          ORDER_STATUS_CONFIG[order.status]?.color ||
          ORDER_STATUS_CONFIG.default.color
        }
      />
    ),
  }));

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    {
      field: "delivery_date",
      headerName: "Delivery Date",
      type: "date",
      flex: 1,
    },
    { field: "total_amount", headerName: "Total Amount", flex: 1 },
    { field: "customer_name", headerName: "Customer Name", flex: 1 },
    { field: "customer_mobile", headerName: "Customer Mobile", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", py: 3, px: { xs: 1, sm: 2 } }}>
      {loading && <Loader message="Loading..." />}
      <Typography variant="h5" gutterBottom>
        Orders List
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3, my: 3 }}>
        <Grid item xs={6} md={3}>
          <DateSelectorComponent
            label="Start Date"
            value={startDate}
            onChange={(d) => {
              setStartDate(d);
              if (d > endDate) setEndDate(d);
            }}
            sx={{ width: { xs: 150, md: 180 } }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <DateSelectorComponent
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate}
            sx={{ width: { xs: 150, md: 180 } }}
          />
        </Grid>

        <Grid item xs={12} md={2.5} lg={2.5}>
          <FormControl sx={{ width: "100%" }} variant="outlined">
            <InputLabel shrink={true}>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              displayEmpty
              sx={{ width: { xs: 150, md: 160 } }}
              renderValue={(selected) => {
                if (selected === "") return "All";
                const selectedOption = [
                  { value: "0", label: "Pending" },
                  { value: "1", label: "Completed" },
                  { value: "-1", label: "Cancelled" },
                ].find((opt) => opt.value === selected);
                return selectedOption?.label || selected;
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Pending</MenuItem>
              <MenuItem value="1">Completed</MenuItem>
              <MenuItem value="-1">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2.5} lg={2.5}>
          <Autocomplete
            options={branches}
            getOptionLabel={(o) => `${o.code} - ${o.name}`}
            value={branches.find((b) => b.id === branchFilter) || null}
            onChange={(e, newVal) => setBranchFilter(newVal?.id || "")}
            sx={{ width: { xs: 150, md: 200 } }}
            renderInput={(params) => <TextField {...params} label="Branch" />}
          />
        </Grid>

        <Grid item xs={12} md={2} lg={2} sx={{ ml: { md: "auto" } }}>
          <TextField
            fullWidth
            label="Search Orders"
            value={search}
            sx={{ width: 320 }}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Grid>
      </Grid>

      {!loading && (
        <TableComponent
          rows={tableRows}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
          onRowClick={(row) => handleOrderClick(row.id)}
        />
      )}

      <ModalComponent
        open={openModal}
        onClose={handleModalClose}
        title="Order Details"
        content={
          modalLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 150,
              }}
            >
              <CircularProgress />
            </Box>
          ) : selectedOrder ? (
            <Box>
              <Typography>
                <strong>Title:</strong> {selectedOrder.title}
              </Typography>
              <Typography>
                <strong>Delivery Date:</strong> {selectedOrder.delivery_date}
              </Typography>
              {selectedOrder.delivered_date && (
                <Typography>
                  <strong>Delivered Date:</strong>{" "}
                  {selectedOrder.delivered_date}
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Customer Name:</strong> {selectedOrder.customer_name}
              </Typography>
              <Typography>
                <strong>Customer Mobile:</strong>{" "}
                {selectedOrder.customer_mobile}
              </Typography>
              <Typography>
                <strong>Customer Email:</strong> {selectedOrder.customer_email}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Status:</strong>{" "}
                <ChipComponent
                  size="small"
                  variant="filled"
                  label={
                    ORDER_STATUS_CONFIG[selectedOrder.status]?.label ||
                    "Unknown"
                  }
                  color={
                    ORDER_STATUS_CONFIG[selectedOrder.status]?.color || "info"
                  }
                />
              </Typography>
              <Typography>
                <strong>Total Amount:</strong> {selectedOrder.total_amount}
              </Typography>
              <Typography>
                <strong>Advance Amount:</strong> {selectedOrder.advance_amount}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Employee Name:</strong>{" "}
                {selectedOrder.employee?.name || "-"}
              </Typography>
              <Typography>
                <strong>Employee Code:</strong>{" "}
                {selectedOrder.employee?.employee_code || "-"}
              </Typography>
              {selectedOrder.status === 1 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography>
                    <strong>Delivered By:</strong>{" "}
                    {selectedOrder.delivered_by
                      ? `${selectedOrder.delivered_by.name} (${selectedOrder.delivered_by.employee_code})`
                      : "-"}
                  </Typography>
                  <Typography>
                    <strong>Delivered At:</strong>{" "}
                    {selectedOrder.delivered_on || "-"}
                  </Typography>
                </>
              )}
            </Box>
          ) : null
        }
      />
    </Box>
  );
};

export default OrdersList;
