import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  Switch,
  Button,
  Fab,
  CircularProgress,
  Avatar,
  Autocomplete,
} from "@mui/material";
import { getRoleFromToken } from "../../utils/auth";
import AddIcon from "@mui/icons-material/Add";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ModalComponent from "../../components/ModalComponent";
import apiConfig from "../../config/apiConfig";
import { userStatusMap } from "../../constants/statuses";
import ExportMenu from "../../components/ExportMenu";
import { STRINGS } from "../../constants/strings";

const statusOptions = [
  { name: "All", id: "" },
  { name: "Active", id: "1" },
  { name: "Disabled", id: "0" },
  { name: "Deleted", id: "-1" },
];

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

const AllEmployees = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
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
  const [branchFilter, setBranchFilter] = useState("");
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
        if (data.success) {
          setBranches([
            { id: "", code: "All", name: "Branches" },
            ...(data.branches || []),
          ]);
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

    const params = new URLSearchParams();

    if (statusFilter.id) params.append("status", statusFilter.id);
    if (branchFilter) params.append("branch_id", branchFilter);
    if (searchTerm.trim()) params.append("q", searchTerm.trim());

    url += `&${params.toString()}`;

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
        throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);
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

  const confirmationModalContent = (
    <Box>
      {confirmPayload.currentStatus === 1
        ? STRINGS.DISABLE_EMPLOYEE_CONFIRMATION
        : STRINGS.ENABLE_EMPLOYEE_CONFIRMATION}
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="text" onClick={() => setConfirmModalOpen(false)}>
          {STRINGS.CANCEL}
        </Button>
        <Button variant="text" onClick={handleConfirmToggle} autoFocus>
          {STRINGS.CONFIRM}
        </Button>
      </Box>
    </Box>
  );

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
            display: { xs: "none", sm: "flex" },
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
      headerName: "",
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
    addField("branch_id", branchFilter || "");
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

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 500);
  };

  return (
    <Box sx={{ maxWidth: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">All Employees</Typography>
        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
          disabled={employees.length === 0}
        />
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: {
            xs: "flex-start",
            md: "flex-end",
          },
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ width: { xs: 120, sm: 170, md: 200 } }}>
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

        <Box sx={{ width: { xs: 165, sm: 200, md: 250 } }}>
          <Autocomplete
            options={branches}
            getOptionLabel={(o) => `${o.code} - ${o.name}`}
            value={branches.find((b) => b.id === branchFilter) || null}
            onChange={(e, newVal) => setBranchFilter(newVal?.id || "")}
            sx={{ width: "100%" }}
            renderInput={(params) => <TextField {...params} label="Branch" />}
            disabled={loadingBranches}
          />
        </Box>

        <Box sx={{ width: { xs: "100%", sm: 300 } }}>
          <TextField
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
        title={STRINGS.CONFIRM_ACTION}
        content={confirmationModalContent}
      />

      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          boxShadow: 3,
        }}
        onClick={() => {
          if (role === "admin") {
            navigate(ROUTES.ADMIN.CREATE_EMPLOYEE);
          }
          if (role === "super_admin") {
            navigate(ROUTES.SUPER_ADMIN.CREATE_EMPLOYEE);
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default AllEmployees;
