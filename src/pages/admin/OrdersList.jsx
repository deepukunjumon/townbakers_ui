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
  Fab,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
import { useLocation, useNavigate } from "react-router-dom";
import { getRoleFromToken } from "../../utils/auth";
import { ROUTES } from "../../constants/routes";
import IconButtonComponent from "../../components/IconButtonComponent";
import ConfirmDialog from "../../components/ConfirmDialog";
import TimePickerComponent from "../../components/TimePickerComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import TextFieldComponent from "../../components/TextFieldComponent";

const OrdersList = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const location = useLocation();
  const currentDate = new Date();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });
  const [startDate, setStartDate] = useState(() => {
    const { todayOnly } = location.state || {};
    return todayOnly ? currentDate : currentDate;
  });
  const [endDate, setEndDate] = useState(() => {
    const { todayOnly } = location.state || {};
    return todayOnly ? currentDate : currentDate;
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    const { status } = location.state || {};
    if (status === "pending") return "0";
    if (status === "delivered") return "1";
    return "";
  });
  const [branchFilter, setBranchFilter] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState(null);
  const [originalOrder, setOriginalOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const [paymentStatus, setPaymentStatus] = useState("0");
  const [advanceError, setAdvanceError] = useState("");

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

  const fetchEmployeesByBranch = async (branchId) => {
    if (!branchId) {
      setEmployees([]);
      return;
    }
    try {
      const token = getToken();
      const res = await fetch(
        `${apiConfig.BASE_URL}/admin/branch/${branchId}/employees`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees || []);
      } else {
        setEmployees([]);
      }
    } catch {
      setEmployees([]);
    }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      start_date: format(startDate, "yyyy-MM-dd"),
      end_date: format(endDate, "yyyy-MM-dd"),
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: debouncedSearch,
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
    debouncedSearch,
    statusFilter,
    branchFilter,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

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

  const handleDeleteOrder = async (orderId) => {
    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${apiConfig.DELETE_ORDER(orderId)}`, {
        method: "DELETE",
        headers: { Authorization: `${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Order deleted successfully",
        });
        fetchOrders(); // Refresh the list
      } else {
        throw new Error(data.message || "Failed to delete order");
      }
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err.message || "Failed to delete order",
      });
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const handleEditClick = async (order) => {
    setEditModalOpen(true);
    setModalLoading(true);
    try {
      const [branchesRes, employeesRes] = await Promise.all([
        fetch(apiConfig.MINIMAL_BRANCHES, {
          headers: { Authorization: getToken() },
        }),
        fetch(apiConfig.MINIMAL_EMPLOYEES, {
          headers: { Authorization: getToken() },
        }),
      ]);
      const branchesData = await branchesRes.json();
      const employeesData = await employeesRes.json();
      if (branchesData.success) setBranchList(branchesData.branches || []);
      if (employeesData.success) setEmployeeList(employeesData.employees || []);

      const token = getToken();
      const res = await fetch(apiConfig.ORDER_DETAILS(order.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.order) {
        // Find the full branch and employee objects from the minimal lists
        // Use nested branch and employee objects to get IDs
        const branchId = data.order.branch?.id;
        const employeeId = data.order.employee?.id;
        const branchObj =
          (branchesData.branches || []).find(
            (b) => String(b.id) === String(branchId)
          ) || null;
        const employeeObj =
          (employeesData.employees || []).find(
            (e) => String(e.id) === String(employeeId)
          ) || null;
        setOrderToEdit({
          ...data.order,
          branch: branchObj,
          employee: employeeObj,
          delivery_date: data.order.delivery_date ? new Date(data.order.delivery_date) : null,
        });
        setOriginalOrder({
          ...data.order,
          branch: branchObj,
          employee: employeeObj,
          delivery_date: data.order.delivery_date ? new Date(data.order.delivery_date) : null,
        });
        setPaymentStatus(data.order.payment_status?.toString() || "0");
      } else {
        throw new Error(data.message || "Failed to load order details");
      }
    } catch {}
    setModalLoading(false);
  };

  // Ensure orderToEdit.branch and employee always match the latest branchList/employeeList objects
  useEffect(() => {
    if (editModalOpen && orderToEdit && branchList.length && employeeList.length) {
      const branchObj = branchList.find(b => String(b.id) === String(orderToEdit.branch?.id)) || null;
      const employeeObj = employeeList.find(e => String(e.id) === String(orderToEdit.employee?.id)) || null;
      if (orderToEdit.branch !== branchObj || orderToEdit.employee !== employeeObj) {
        setOrderToEdit(prev => ({
          ...prev,
          branch: branchObj,
          employee: employeeObj,
        }));
      }
    }
  }, [editModalOpen, orderToEdit, branchList, employeeList]);

  const handleUpdateOrder = async () => {
    if (!orderToEdit || !originalOrder) return;

    // Sync paymentStatus to orderToEdit before diffing
    const updatedOrder = { ...orderToEdit, payment_status: paymentStatus };

    setUpdating(true);
    try {
      const token = getToken();
      const fieldsToCheck = [
        "title",
        "description",
        "remarks",
        "delivery_date",
        "delivery_time",
        "customer_name",
        "customer_email",
        "customer_mobile",
        "total_amount",
        "advance_amount",
        // payment_status handled below
      ];
      const updatedFields = {};
      fieldsToCheck.forEach((field) => {
        if (updatedOrder[field] !== originalOrder[field]) {
          updatedFields[field] = updatedOrder[field];
        }
      });
      // Always check payment_status
      if (updatedOrder.payment_status !== originalOrder.payment_status) {
        updatedFields.payment_status = updatedOrder.payment_status;
      }
      // For branch and employee, compare by id
      if (
        (orderToEdit.branch?.id || null) !== (originalOrder.branch?.id || null)
      ) {
        updatedFields.branch_id = orderToEdit.branch?.id || null;
      }
      if (
        (orderToEdit.employee?.id || null) !==
        (originalOrder.employee?.id || null)
      ) {
        updatedFields.employee_id = orderToEdit.employee?.id || null;
      }
      // Always include id
      updatedFields.id = orderToEdit.id;
      if (updatedFields.delivery_date) {
        updatedFields.delivery_date = updatedFields.delivery_date
          ? typeof updatedFields.delivery_date === "string"
            ? updatedFields.delivery_date
            : format(new Date(updatedFields.delivery_date), "yyyy-MM-dd")
          : null;
      }
      const res = await fetch(
        `${apiConfig.ADMIN_UPDATE_ORDER(orderToEdit.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedFields),
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Order updated successfully",
        });
        setEditModalOpen(false);
        setOrderToEdit(null);
        setOriginalOrder(null);
        fetchOrders();
      } else {
        throw new Error(data.message || "Failed to update order");
      }
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: err.message || "Failed to update order",
      });
    } finally {
      setUpdating(false);
    }
  };

  const tableRows = orders.map((order) => ({
    id: order.id,
    title: order.title,
    delivery_date: order.delivery_date,
    total_amount: `₹${order.total_amount}`,
    branch_name: order.branch.name,
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
    actions: (
      <Box sx={{ display: "flex", gap: 1 }}>
        {order.is_deletable && (
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
        )}
        {order.is_editable && (
          <IconButtonComponent
            icon={EditIcon}
            color="primary"
            size="small"
            title="Edit Order"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(order);
            }}
          />
        )}
      </Box>
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
    { field: "branch_name", headerName: "Branch", flex: 1 },
    { field: "customer_name", headerName: "Customer Name", flex: 1 },
    { field: "customer_mobile", headerName: "Customer Mobile", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "actions", headerName: "Actions", flex: 0.5 },
  ];

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
        <Grid item xs={6} md={3}>
          <DateSelectorComponent
            label="Start Date"
            value={startDate}
            onChange={(d) => {
              setStartDate(d);
              if (d > endDate) setEndDate(d);
            }}
            sx={{ width: { xs: 166, md: 180 } }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <DateSelectorComponent
            label="End Date"
            value={endDate}
            onChange={setEndDate}
            minDate={startDate}
            sx={{ width: { xs: 166, md: 180 } }}
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
              sx={{ width: { xs: 166, md: 160 } }}
              renderValue={(selected) => {
                if (selected === "") return "All";
                const selectedOption = [
                  { value: "0", label: "Pending" },
                  { value: "1", label: "Delivered" },
                  { value: "-1", label: "Cancelled" },
                ].find((opt) => opt.value === selected);
                return selectedOption?.label || selected;
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Pending</MenuItem>
              <MenuItem value="1">Delivered</MenuItem>
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
            sx={{ width: { xs: 166, md: 200 } }}
            renderInput={(params) => <TextField {...params} label="Branch" />}
          />
        </Grid>

        <Grid
          item
          xs={12}
          md={2}
          lg={2}
          sx={{ ml: { md: "auto" }, width: { xs: "100%", md: 280 } }}
        >
          <TextField
            fullWidth
            label="Search Orders"
            value={search}
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          if (role === "admin") {
            navigate(ROUTES.ADMIN.CREATE_ORDER);
          } else if (role === "super_admin") {
            navigate(ROUTES.SUPER_ADMIN.CREATE_ORDER);
          }
        }}
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
                <strong>Description:</strong> {selectedOrder.description}
              </Typography>
              {selectedOrder.remarks && (
                <Typography>
                  <strong>Remarks:</strong> {selectedOrder.remarks}
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Delivery Date:</strong>{" "}
                {selectedOrder.delivery_date
                  ? format(new Date(selectedOrder.delivery_date), "dd-MM-yyyy")
                  : "-"}
              </Typography>
              <Typography>
                <strong>Delivery Time:</strong>{" "}
                {selectedOrder.delivery_time || "-"}
              </Typography>
              {selectedOrder.delivered_date && (
                <Typography>
                  <strong>Delivered Date:</strong>{" "}
                  {format(new Date(selectedOrder.delivered_date), "dd-MM-yyyy")}
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
                <strong>Total Amount:</strong> ₹{selectedOrder.total_amount}
              </Typography>
              <Typography>
                <strong>Advance Amount:</strong> ₹{selectedOrder.advance_amount}
              </Typography>
              {selectedOrder.advance_amount && (
                <Typography>
                  <strong>Balance Amount:</strong> ₹
                  {selectedOrder.balance_amount}
                </Typography>
              )}
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

      <ModalComponent
        open={editModalOpen}
        title="Edit Order"
        onClose={() => {
          setEditModalOpen(false);
          setOrderToEdit(null);
          setOriginalOrder(null);
        }}
        content={
          modalLoading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight={150}
              maxWidth="auto"
            >
              <CircularProgress />
            </Box>
          ) : orderToEdit ? (
            <Box
              component="form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateOrder();
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {/* Order Info */}
              <Box>
                <Typography variant="h6" mb={2}>
                  Order Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextFieldComponent
                      label="Order Title"
                      name="title"
                      value={orderToEdit.title}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          title: e.target.value,
                        })
                      }
                      sx={{ minWidth: { xs: 300, sm: 520 } }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextFieldComponent
                      label="Description"
                      name="description"
                      value={orderToEdit.description}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          description: e.target.value,
                        })
                      }
                      multiline
                      rows={3}
                      sx={{ minWidth: { xs: 300, sm: 250 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextFieldComponent
                      label="Remarks"
                      name="remarks"
                      value={orderToEdit.remarks}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          remarks: e.target.value,
                        })
                      }
                      multiline
                      rows={3}
                      sx={{ minWidth: { xs: 300, sm: 250 } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Delivery Info */}
              <Box>
                <Typography variant="h6" mb={2}>
                  Delivery Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DateSelectorComponent
                      label="Delivery Date"
                      name="delivery_date"
                      value={orderToEdit.delivery_date}
                      onChange={(date) =>
                        setOrderToEdit({ ...orderToEdit, delivery_date: date })
                      }
                      minDate={new Date()}
                      sx={{ maxWidth: { xs: "100%", sm: "100%" } }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TimePickerComponent
                      label="Delivery Time"
                      name="delivery_time"
                      value={orderToEdit.delivery_time}
                      onChange={(time) =>
                        setOrderToEdit({ ...orderToEdit, delivery_time: time })
                      }
                      sx={{ maxWidth: { xs: "100%", sm: "100%" } }}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Customer Info */}
              <Box maxWidth="auto">
                <Typography variant="h6" mb={2}>
                  Customer Information
                </Typography>
                <Grid container spacing={3} gap={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextFieldComponent
                      label="Customer Name"
                      name="customer_name"
                      value={orderToEdit.customer_name}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          customer_name: e.target.value,
                        })
                      }
                      sx={{ minWidth: { xs: 300, sm: 250 } }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextFieldComponent
                      label="Customer Mobile"
                      name="customer_mobile"
                      value={orderToEdit.customer_mobile}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          customer_mobile: e.target.value,
                        })
                      }
                      sx={{ minWidth: { xs: 300, sm: 250 } }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextFieldComponent
                      label="Customer Email"
                      name="customer_email"
                      value={orderToEdit.customer_email}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          customer_email: e.target.value,
                        })
                      }
                      sx={{ minWidth: { xs: 300 } }}
                      type="email"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Financial Details */}
              <Box>
                <Typography variant="h6" mb={2}>
                  Financial Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextFieldComponent
                      label="Total Amount"
                      name="total_amount"
                      type="number"
                      value={orderToEdit.total_amount}
                      onChange={(e) =>
                        setOrderToEdit({
                          ...orderToEdit,
                          total_amount: e.target.value,
                        })
                      }
                      fullWidth
                      required
                      sx={{ minWidth: "auto" }}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  {paymentStatus === "1" && (
                    <Grid item xs={12} sm={6} sx={{ mt: 0 }}>
                      <TextFieldComponent
                        label="Advance Amount"
                        name="advance_amount"
                        type="number"
                        value={orderToEdit.advance_amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          let error = "";
                          if (Number(val) < 0)
                            error = "Advance cannot be negative";
                          else if (
                            Number(val) > Number(orderToEdit.total_amount || 0)
                          )
                            error = "Advance cannot exceed total amount";
                          setAdvanceError(error);
                          setOrderToEdit({
                            ...orderToEdit,
                            advance_amount: val,
                          });
                        }}
                        required
                        fullWidth
                        inputProps={{
                          min: 0,
                          max: orderToEdit.total_amount || undefined,
                          step: 0.01,
                        }}
                        error={!!advanceError}
                        helperText={advanceError}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6} sx={{ mt: 0 }}>
                    <TextFieldComponent
                      label="Balance Amount"
                      name="balance_amount"
                      type="number"
                      disabled
                      value={(() => {
                        if (paymentStatus === "2") return "0.00";
                        if (paymentStatus === "0")
                          return Number(orderToEdit.total_amount || 0).toFixed(
                            2
                          );
                        // Advance Only
                        return Math.max(
                          0,
                          Number(orderToEdit.total_amount || 0) -
                            Number(orderToEdit.advance_amount || 0)
                        ).toFixed(2);
                      })()}
                      inputProps={{
                        min: 0,
                        max: orderToEdit.total_amount || undefined,
                        step: 0.01,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Payment
                    </Typography>
                    <RadioGroup
                      row
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <FormControlLabel
                        value="2"
                        control={<Radio />}
                        label="Full paid"
                      />
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="Advance Only"
                      />
                      <FormControlLabel
                        value="0"
                        control={<Radio />}
                        label="Unpaid"
                      />
                    </RadioGroup>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Branch Details */}
              <Box>
                <Typography variant="h6" mb={2}>
                  Branch Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <SelectFieldComponent
                      label="Branch"
                      value={orderToEdit.branch}
                      onChange={(e) => {
                        setOrderToEdit({
                          ...orderToEdit,
                          branch: e.target.value,
                        });
                      }}
                      options={branchList}
                      valueKey="id"
                      displayKey={(b) => `${b.code} - ${b.name}`}
                      required
                      fullWidth
                      sx={{ minWidth: { xs: 320 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <SelectFieldComponent
                      label="Employee"
                      value={orderToEdit.employee}
                      onChange={(e) => {
                        setOrderToEdit({ ...orderToEdit, employee: e.target.value });
                      }}
                      options={employeeList}
                      valueKey="id"
                      displayKey={(emp) => `${emp.employee_code} - ${emp.name}`}
                      required
                      fullWidth
                      sx={{ minWidth: { xs: 320 } }}
                      disabled={!orderToEdit.branch}
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Actions */}
              <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setEditModalOpen(false);
                    setOrderToEdit(null);
                    setOriginalOrder(null);
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update"}
                </Button>
              </Box>
            </Box>
          ) : null
        }
      />

      <ModalComponent
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        title="Confirm Delete"
        content={
          orderToDelete ? (
            <Box>
              <Typography>
                Are you sure you want to delete the order "{orderToDelete.title}
                "?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This action cannot be undone.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setOrderToDelete(null);
                  }}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteOrder(orderToDelete.id)}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
              </Box>
            </Box>
          ) : null
        }
      />
    </Box>
  );
};

export default OrdersList;
