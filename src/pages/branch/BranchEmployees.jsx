import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Fab,
  Switch,
  Typography,
} from "@mui/material";
import TableComponent from "../../components/TableComponent";
import Loader from "../../components/Loader";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import AddIcon from "@mui/icons-material/Add";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";
import { useNavigate, useLocation } from "react-router-dom";
import { getToken } from "../../utils/auth";
import { userStatusMap } from "../../constants/statuses";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ConfirmDialog from "../../components/ConfirmDialog";

const statusOptions = [
  { name: "All", id: "" },
  { name: "Active", id: "1" },
  { name: "Disabled", id: "0" },
  { name: "Deleted", id: "-1" },
];

const BranchEmployees = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSwitches, setLoadingSwitches] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState(() => {
    const fromDashboard = location.state?.fromDashboard;
    return fromDashboard ? statusOptions[1] : statusOptions[0];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);
  const controllerRef = useRef(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({
    id: null,
    currentStatus: null,
  });

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const h = Math.abs(hash) % 360;
    const s = 70 + (Math.abs(hash >> 8) % 30);
    const l = 45 + (Math.abs(hash >> 16) % 10);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  const fetchEmployees = useCallback(
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
          status: statusFilter.id,
        }).toString();

        const res = await fetch(`${apiConfig.BRANCH_EMPLOYEES}?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: newController.signal,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setEmployees(data.employees || []);
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
    [pagination.current_page, pagination.per_page, statusFilter]
  );

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees(searchTerm);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchEmployees]);

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value || statusOptions[0];
    setStatusFilter(selectedStatus);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const handleToggleStatus = (employeeId, currentStatus) => {
    setConfirmPayload({ id: employeeId, currentStatus });
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    const { id, currentStatus } = confirmPayload;
    if (!id) {
      setConfirmModalOpen(false);
      return;
    }

    setConfirmModalOpen(false);
    const newStatus = currentStatus === 1 ? 0 : 1;
    setLoadingSwitches((prev) => ({ ...prev, [id]: true }));

    const token = getToken();
    try {
      const res = await fetch(apiConfig.UPDATE_EMPLOYEE_STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong");
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === id ? { ...emp, status: newStatus } : emp
        )
      );

      setSnack({
        open: true,
        severity: "success",
        message: data.message,
      });
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to update status",
      });
    } finally {
      setLoadingSwitches((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const getConfirmationDialogProps = () => {
    const { currentStatus } = confirmPayload;
    
    if (currentStatus === 1) {
      return {
        title: "Disable Employee",
        content: STRINGS.DISABLE_EMPLOYEE_CONFIRMATION,
        type: "warning",
        confirmText: "Disable",
        confirmColor: "warning",
      };
    }
    
    return {
      title: "Enable Employee",
      content: STRINGS.ENABLE_EMPLOYEE_CONFIRMATION,
      type: "success",
      confirmText: "Enable",
      confirmColor: "success",
    };
  };

  const columns = [
    { field: "employee_code", headerName: "Employee Code", flex: 1 },
    {
      field: "avatar",
      headerName: "",
      flex: 0.5,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Avatar
          sx={{
            bgcolor: stringToColor(params.row.name),
            color: "#fff",
            width: 32,
            height: 32,
            fontWeight: 600,
            fontSize: 16,
            mr: 1,
          }}
          alt={params.row.name}
        >
          {params.row.name ? params.row.name.charAt(0).toUpperCase() : "?"}
        </Avatar>
      ),
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const key = String(params.value);
        const status = userStatusMap[key] || {
          label: "Unknown",
          color: "default",
        };
        return (
          <Chip
            label={status.label}
            color={status.color}
            size="small"
            variant="filled"
            sx={{ fontSize: 13, color: "white" }}
          />
        );
      },
    },
    {
      field: "toggle",
      headerName: "",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const statusNum = Number(params.row.status);
        const isLoading = !!loadingSwitches[params.row.id];
        if (statusNum !== 0 && statusNum !== 1) return null;
        return (
          <Switch
            checked={statusNum === 1}
            onChange={() => {
              if (!isLoading) {
                handleToggleStatus(params.row.id, statusNum);
              }
            }}
            size="medium"
            color="primary"
            disabled={isLoading}
          />
        );
      },
    },
  ];

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 300);
  };

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Branch Employees
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 2,
          width: "100%",
        }}
      >
        <Box sx={{ width: { xs: 135, sm: 170, md: 200 } }}>
          <SelectFieldComponent
            label="Status"
            name="status"
            value={statusFilter}
            onChange={handleStatusChange}
            options={statusOptions}
            valueKey="id"
            displayKey="name"
            fullWidth
          />
        </Box>
        <Box sx={{ width: 300 }}>
          <TextFieldComponent
            label="Search"
            variant="outlined"
            fullWidth
            onChange={handleSearchChange}
            placeholder="Search employees..."
          />
        </Box>
      </Box>

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      {loading && <Loader message="Loading..." />}

      {!loading && (
        <TableComponent
          rows={employees}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={({ page, rowsPerPage }) =>
            handlePaginationChange({ page, rowsPerPage })
          }
        />
      )}

      <ConfirmDialog
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmToggle}
        {...getConfirmationDialogProps()}
      />

      <Fab
        color="primary"
        onClick={() => navigate(ROUTES.BRANCH.CREATE_EMPLOYEE)}
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          boxShadow: 3,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default BranchEmployees;
