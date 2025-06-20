import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Fab,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Stack,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import TableComponent from "../../components/TableComponent";
import ButtonComponent from "../../components/ButtonComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import { getToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import ModalComponent from "../../components/ModalComponent";
import Loader from "../../components/Loader";
import { STRINGS } from "../../constants/strings";
import ChipComponent from "../../components/ChipComponent";
import { ORDER_PAYMENT_STATUS_CONFIG, ORDER_STATUS_CONFIG } from "../../constants/statuses";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { getRoleFromToken } from "../../utils/auth";
import { ROUTES } from "../../constants/routes";
import IconButtonComponent from "../../components/IconButtonComponent";
import ConfirmDialog from "../../components/ConfirmDialog";

const ListOrders = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const currentDate = new Date();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [startDate, setStartDate] = useState(currentDate);
  const [endDate, setEndDate] = useState(currentDate);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const { status } = location.state || {};
    if (status === "pending") {
      return "0";
    }
    return "";
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const controllerRef = useRef(null);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    order: null,
  });

  const fetchOrders = useCallback(
    async (search = "") => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const token = getToken();
      const newController = new AbortController();
      controllerRef.current = newController;

      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: pagination.current_page,
          per_page: pagination.per_page,
          search: search.trim(),
          status: statusFilter,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        }).toString();

        const res = await fetch(`${apiConfig.BRANCH_ORDERS}?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: newController.signal,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setOrders(data.orders || []);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
          }));
        } else {
          throw new Error(data.message || STRINGS.FAILED_TO_COMPLETE_ACTION);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnack({
            open: true,
            severity: "error",
            message: error.message || STRINGS.SOMETHING_WENT_WRONG,
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [
      pagination.current_page,
      pagination.per_page,
      statusFilter,
      startDate,
      endDate,
    ]
  );

  useEffect(() => {
    fetchOrders(search);
  }, [fetchOrders, search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

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
    setModalLoading(true);
    try {
      const token = getToken();
      const res = await fetch(apiConfig.ORDER_DETAILS(orderId), {
        headers: { Authorization: `Bearer ${token}` },
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
        setSelectedOrder(null);
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to fetch order details",
      });
      setSelectedOrder(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (status) => {
    if (!selectedOrder) return;
    setModalLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${apiConfig.UPDATE_ORDER_STATUS(selectedOrder.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: "Order status updated successfully",
        });

        const orderRes = await fetch(
          `${apiConfig.ORDER_DETAILS(selectedOrder.id)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          setSelectedOrder(orderData.order);
        }
        fetchOrders(search);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to update order status",
        });
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to update order status",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleShowEmployeeSelect = async () => {
    await fetchEmployees();
    setShowEmployeeSelect(true);
  };

  const fetchEmployees = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${apiConfig.MINIMAL_EMPLOYEES}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to load employees",
        });
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load employees",
      });
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!selectedOrder || !selectedEmployee) return;
    setModalLoading(true);
    try {
      const token = getToken();
      const res = await fetch(apiConfig.UPDATE_ORDER_STATUS(selectedOrder.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 1,
          delivered_by: selectedEmployee.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: "Order marked as delivered",
        });
        const orderRes = await fetch(
          apiConfig.ORDER_DETAILS(selectedOrder.id),
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const orderData = await orderRes.json();
        if (orderData.success && orderData.order) {
          setSelectedOrder(orderData.order);
        }
        setShowEmployeeSelect(false);
        setSelectedEmployee(null);
        fetchOrders(search);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to update order status",
        });
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to update order status",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (order) => {
    setConfirmDelete({ open: true, order });
  };

  const handleDeleteOrder = async () => {
    if (!confirmDelete.order) return;

    try {
      const token = getToken();
      const res = await fetch(
        `${apiConfig.DELETE_ORDER(confirmDelete.order.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: "Order deleted successfully.",
        });
        setConfirmDelete({ open: false, order: null });
        fetchOrders(search); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to delete order.");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message,
      });
    }
  };

  const tableRows = orders.map((order) => ({
    ...order,
    status: (
      <ChipComponent
        label={ORDER_STATUS_CONFIG[order.status]?.label || "Unknown"}
        color={ORDER_STATUS_CONFIG[order.status]?.color || "default"}
      />
    ),
    actions:
      order.status !== 1 ? (
        <IconButtonComponent
          icon={DeleteIcon}
          color="error"
          size="small"
          title="Delete Order"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(order);
          }}
        />
      ) : null,
  }));

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "delivery_date", headerName: "Delivery Date", flex: 1 },
    { field: "total_amount", headerName: "Total Amount", flex: 1 },
    { field: "customer_name", headerName: "Customer Name", flex: 1 },
    { field: "customer_mobile", headerName: "Customer Mobile", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "actions", headerName: "Actions", flex: 0.5 },
  ];

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    if (newDate > endDate) {
      setEndDate(newDate);
    }
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  return (
    <Box sx={{ maxWidth: "auto" }}>
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
        <Grid item xs={6} md={3} lg={3}>
          <DateSelectorComponent
            label="Start Date"
            value={startDate}
            onChange={handleStartDateChange}
            sx={{ width: { xs: 166, md: "auto" } }}
          />
        </Grid>
        <Grid item xs={6} md={3} lg={3}>
          <DateSelectorComponent
            label="End Date"
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate}
            sx={{ width: { xs: 166, md: "auto" } }}
          />
        </Grid>

        <Grid item xs={12} md={2.5} lg={2.5}>
          <FormControl sx={{ width: { xs: 150, md: 160 } }} variant="outlined">
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Pending</MenuItem>
              <MenuItem value="1">Delivered</MenuItem>
              <MenuItem value="-1">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2} lg={2} sx={{ ml: { xs: 0, md: "auto" } }}>
          <TextField
            label="Search Orders"
            value={search}
            onChange={handleSearchChange}
            variant="outlined"
            sx={{ width: { xs: 182, md: 300 } }}
          />
        </Grid>
      </Grid>

      {!loading && orders.length > 0 && (
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

      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, order: null })}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        content={`Are you sure you want to delete the order titled "${confirmDelete.order?.title || ""
          }"?`}
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate(ROUTES.BRANCH.CREATE_ORDER)}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon />
      </Fab>

      <ModalComponent
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedOrder(null);
          setModalLoading(false);
          setShowEmployeeSelect(false);
          setSelectedEmployee(null);
        }}
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
            <>
              <Box mb={2}>
                <Typography>
                  <strong>Title:</strong> {selectedOrder.title}
                </Typography>
                <Typography>
                  <strong>Delivery Date:</strong>{" "}
                  {selectedOrder.delivery_date
                    ? format(new Date(selectedOrder.delivery_date), "dd-MM-yyyy")
                    : "-"}
                </Typography>
                {selectedOrder.delivered_date && (
                  <Typography>
                    <strong>Delivered Date:</strong>{" "}
                    {format(new Date(selectedOrder.delivered_date), "dd-MM-yyyy")}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box mb={2}>
                <Typography>
                  <strong>Customer Name:</strong> {selectedOrder.customer_name}
                </Typography>
                <Typography>
                  <strong>Customer Mobile:</strong>{" "}
                  {selectedOrder.customer_mobile}
                </Typography>
                <Typography>
                  <strong>Customer Email:</strong>{" "}
                  {selectedOrder.customer_email}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box mb={2}>
                <Typography>
                  <strong>Order Status:</strong>{" "}
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
                  <strong>Payment Status:</strong>{" "}
                  <ChipComponent
                    size="small"
                    variant="filled"
                    label={
                      ORDER_PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]
                        ?.label || "Unknown"
                    }
                    color={
                      ORDER_PAYMENT_STATUS_CONFIG[selectedOrder.payment_status]
                        ?.color || "info"
                    }
                  />
                </Typography>
                <Typography>
                  <strong>Total Amount:</strong> ₹{selectedOrder.total_amount}
                </Typography>
                <Typography>
                  <strong>Advance Amount:</strong>{" "}
                  {selectedOrder.advance_amount
                    ? `₹${selectedOrder.advance_amount}`
                    : "N/A"}
                </Typography>
                {selectedOrder.advance_amount && (
                  <Typography>
                    <strong>Balance Amount:</strong> ₹
                    {selectedOrder.balance_amount}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box>
                <Typography>
                  <strong>Employee Name:</strong>{" "}
                  {selectedOrder.employee ? selectedOrder.employee.name : "-"}
                </Typography>
                <Typography>
                  <strong>Employee Code:</strong>{" "}
                  {selectedOrder.employee
                    ? selectedOrder.employee.employee_code
                    : "-"}
                </Typography>
              </Box>
              {selectedOrder.status === 1 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography>
                      <strong>Delivered By:</strong>{" "}
                      {selectedOrder.delivered_by
                        ? `${selectedOrder.delivered_by.name} (${selectedOrder.delivered_by.employee_code})`
                        : "-"}
                    </Typography>
                    <Typography>
                      <strong>Delivered At:</strong>{" "}
                      {selectedOrder.delivered_on
                        ? selectedOrder.delivered_on
                        : "-"}
                    </Typography>
                  </Box>
                </>
              )}
              {selectedOrder.status === 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }} />
                  {showEmployeeSelect ? (
                    <Stack spacing={2}>
                      <Autocomplete
                        options={employees}
                        getOptionLabel={(option) =>
                          `${option.employee_code} - ${option.name}`
                        }
                        value={selectedEmployee}
                        onChange={(_, value) => setSelectedEmployee(value)}
                        renderInput={(params) => (
                          <TextField {...params} label="Select Employee" />
                        )}
                      />
                      <Stack direction="row" spacing={2}>
                        <ButtonComponent
                          variant="contained"
                          color="success"
                          disabled={!selectedEmployee}
                          onClick={handleMarkAsDelivered}
                        >
                          Delivered
                        </ButtonComponent>
                        <ButtonComponent
                          variant="outlined"
                          color="inherit"
                          onClick={() => {
                            setShowEmployeeSelect(false);
                            setSelectedEmployee(null);
                          }}
                        >
                          Cancel
                        </ButtonComponent>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={2}>
                      <ButtonComponent
                        variant="contained"
                        color="success"
                        onClick={handleShowEmployeeSelect}
                        sx={{ minWidth: { xs: 20, md: 120 } }}
                      >
                        Delivered
                      </ButtonComponent>
                      <ButtonComponent
                        variant="contained"
                        color="error"
                        onClick={() => handleUpdateOrderStatus(-1)}
                      >
                        Cancelled
                      </ButtonComponent>
                    </Stack>
                  )}
                </Box>
              )}
            </>
          ) : null
        }
      />
    </Box>
  );
};

export default ListOrders;
