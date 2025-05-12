import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress, Grid, TextField, Button, Modal, Chip } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import { getToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import Pagination from "@mui/material/Pagination";
import { format, startOfMonth, endOfMonth } from "date-fns";
import DateSelectorComponent from "../../components/DateSelectorComponent";

const ListOrders = () => {
  const currentDate = new Date();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [startDate, setStartDate] = useState(startOfMonth(currentDate));
  const [endDate, setEndDate] = useState(endOfMonth(currentDate));
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: "error", message: "" });

  useEffect(() => {
    fetchOrders();
  }, [pagination.current_page, startDate, endDate, search]);

  const fetchOrders = async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: search,
    });

    try {
      const res = await fetch(`${apiConfig.BASE_URL}/branch/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setOrders(data.orders);
        setPagination(data.pagination);
      } else {
        setSnack({ open: true, severity: "error", message: data.message || "Failed to load orders" });
      }
    } catch (error) {
      setSnack({ open: true, severity: "error", message: "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaginationChange = (event, value) => {
    setPagination((prev) => ({ ...prev, current_page: value }));
  };

  const handleOrderClick = async (orderId) => {
    setOpenModal(true);
    try {
      const token = getToken();
      const res = await fetch(`${apiConfig.BASE_URL}/branch/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder(data.order);
      } else {
        setSnack({ open: true, severity: "error", message: data.message });
      }
    } catch (error) {
      setSnack({ open: true, severity: "error", message: "Failed to fetch order details" });
    }
  };

  const columns = [
    { field: "title", headerName: "Title", flex: 1 },
    { field: "delivery_date", headerName: "Delivery Date", flex: 1 },
    { field: "total_amount", headerName: "Total Amount", flex: 1 },
    { field: "customer_name", headerName: "Customer Name", flex: 1 },
    { field: "customer_mobile", headerName: "Mobile", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
  ];

  const tableRows = orders.map((order) => ({
    title: order.title,
    delivery_date: order.delivery_date,
    total_amount: order.total_amount,
    customer_name: order.customer_name,
    customer_mobile: order.customer_mobile,
    status: order.status === 0 ? (
      <Chip label="Pending" color="error" />
    ) : (
      <Chip label="Delivered" color="success" />
    ),
    onClick: () => handleOrderClick(order.id),
  }));

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStartDateChange = (newDate) => {
    setStartDate(newDate);
    setOrders([]);
    if (newDate > endDate) {
      setEndDate(newDate);
    }
  };

  const handleEndDateChange = (newDate) => {
    setEndDate(newDate);
    setOrders([]);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Orders List
      </Typography>

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Grid container spacing={2} sx={{ maxWidth: 600 }}>
          <Grid item xs={6}>
            <DateSelectorComponent
              label="Start Date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item xs={6}>
            <DateSelectorComponent
              label="End Date"
              value={endDate}
              onChange={handleEndDateChange}
              minDate={startDate}
            />
          </Grid>
        </Grid>

        <TextField
          label="Search Orders"
          value={search}
          onChange={handleSearchChange}
          variant="outlined"
          sx={{ mb: 2, width: 250 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableComponent rows={tableRows} columns={columns} rowIdField="id" />
      )}

      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={pagination.last_page}
          page={pagination.current_page}
          onChange={handlePaginationChange}
          color="primary"
        />
      </Box>

      {/* Modal for Order Details */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{ padding: 2, width: 400, margin: "auto", mt: 5, backgroundColor: "white" }}>
          {selectedOrder && (
            <>
              <Typography variant="h6" gutterBottom>
                Order Details
              </Typography>
              <Typography><strong>Title:</strong> {selectedOrder.title}</Typography>
              <Typography><strong>Delivery Date:</strong> {selectedOrder.delivery_date}</Typography>
              <Typography><strong>Customer Name:</strong> {selectedOrder.customer_name}</Typography>
              <Typography><strong>Customer Mobile:</strong> {selectedOrder.customer_mobile}</Typography>
              <Typography><strong>Status:</strong> {selectedOrder.status === 0 ? "Pending" : "Delivered"}</Typography>
              <Typography><strong>Total Amount:</strong> {selectedOrder.total_amount}</Typography>
              <Typography><strong>Advance Amount:</strong> {selectedOrder.advance_amount}</Typography>
              <Button onClick={() => setOpenModal(false)} sx={{ mt: 2 }} variant="contained">Close</Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ListOrders;
