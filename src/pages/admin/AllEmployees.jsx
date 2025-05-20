import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  Switch,
  Button,
  CircularProgress,
} from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ModalComponent from "../../components/ModalComponent";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";
import { userStatusMap } from "../../constants/status";
import ExportMenu from "../../components/ExportMenu";

const statusOptions = [
  { name: "All", id: "" },
  { name: "Active", id: "1" },
  { name: "Disabled", id: "0" },
  { name: "Deleted", id: "-1" },
];

const AllEmployees = () => {
  const branchId = getBranchIdFromToken();
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([{ name: "All", id: "" }]);
  const [loading, setLoading] = useState(true);
  const [loadingBranches, setLoadingBranches] = useState(true);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [branchFilter, setBranchFilter] = useState({ name: "All", id: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);

  const [loadingSwitches, setLoadingSwitches] = useState({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({
    id: null,
    currentStatus: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoadingBranches(true);

    fetch(apiConfig.MINIMAL_BRANCHES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.branches)) {
          const branchOpts = [
            { name: "All", id: "" },
            ...data.branches.map((b) => ({
              name: b.code,
              id: b.code,
            })),
          ];
          setBranches(branchOpts);
          setLoadingBranches(false);
        } else {
          throw new Error("Invalid branches data");
        }
      })
      .catch(() => {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load branches data",
        });
        setLoadingBranches(false);
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);

    let url = `${apiConfig.ALL_EMPLOYEES_LIST}?page=${pagination.current_page}&per_page=${pagination.per_page}`;

    if (statusFilter.id !== "") {
      url += `&status=${statusFilter.id}`;
    }
    if (branchFilter.id !== "") {
      url += `&branch_code=${branchFilter.id}`;
    }
    if (searchTerm.trim() !== "") {
      url += `&q=${encodeURIComponent(searchTerm.trim())}`;
    }

    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
        setLoading(false);
      })
      .catch(() => {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load employee data",
        });
        setLoading(false);
      });
  }, [
    branchId,
    pagination.current_page,
    pagination.per_page,
    statusFilter,
    branchFilter,
    searchTerm,
  ]);

  const handleToggleStatus = async (id, currentStatus) => {
    setConfirmModalOpen(true);
    setConfirmPayload({ id, currentStatus });
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

    const token = localStorage.getItem("token");
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
        throw new Error(data.message || "Failed to update status");
      }

      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === id ? { ...emp, status: newStatus } : emp
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
      setLoadingSwitches((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const confirmationModalContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {confirmPayload.currentStatus === 1
          ? "Are you sure you want to disable this employee?"
          : "Are you sure you want to enable this employee?"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        <Button variant="text" onClick={() => setConfirmModalOpen(false)}>
          Cancel
        </Button>
        <Button variant="text" onClick={handleConfirmToggle} autoFocus>
          Confirm
        </Button>
      </Box>
    </Box>
  );

  const columns = [
    { field: "employee_code", headerName: "Employee Code", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "branch_code", headerName: "Branch Code", flex: 1 },
    { field: "branch_name", headerName: "Branch Name", flex: 1 },
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
      headerName: "Enable/Disable",
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const statusNum = Number(params.row.status);
        const isLoading = !!loadingSwitches[params.row.id];
        if (statusNum !== 0 && statusNum !== 1) return null;
        return (
          <Box sx={{ position: "relative", display: "inline-flex" }}>
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
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  const handleExportClick = (eventOrType) => {
    if (typeof eventOrType === "string") {
      handleExport(eventOrType);
    } else {
      setAnchorEl(eventOrType.currentTarget);
    }
  };

  const handleExportClose = () => setAnchorEl(null);

  const handleExport = (type) => {
    const form = document.createElement("form");
    form.method = "GET";
    form.action = apiConfig.ALL_EMPLOYEES_LIST;

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const token = localStorage.getItem("token");
    if (token) addField("token", token);
    addField("status", statusFilter.id || "");
    addField("branch_code", branchFilter.id || "");
    addField("q", searchTerm.trim() || "");
    addField("export", "true");
    addField("type", type);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    handleExportClose();
  };

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

  const handleBranchChange = (event) => {
    const selectedBranch = event.target.value || branches[0];
    setBranchFilter(selectedBranch);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 500);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Employees
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ width: { xs: 163, md: 200 } }}>
          <SelectFieldComponent
            label="Branch"
            name="branch_code"
            value={branchFilter}
            onChange={handleBranchChange}
            options={branches}
            valueKey="id"
            displayKey="name"
            fullWidth
            disabled={loadingBranches}
          />
        </Box>

        <Box sx={{ width: { xs: 100, md: 200 } }}>
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
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            onChange={handleSearchChange}
            placeholder="Search employees..."
          />
        </Box>

        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
          disabled={employees.length === 0}
        />
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
          rows={employees}
          columns={columns}
          rowIdField="id"
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
        />
      )}

      <ModalComponent
        open={confirmModalOpen}
        onClose={() => {}}
        hideCloseIcon={true}
        title="Confirm Action"
        content={confirmationModalContent}
      />
    </Box>
  );
};

export default AllEmployees;
