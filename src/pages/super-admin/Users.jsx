import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Autocomplete,
  Box,
  Typography,
  Chip,
  Divider,
  TextField,
  Fab,
  Switch,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ModalComponent from "../../components/ModalComponent";
import ButtonComponent from "../../components/ButtonComponent";
import IconButtonComponent from "../../components/IconButtonComponent";

import { getRoleFromToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import { userStatusMap } from "../../constants/statuses";
import { ROUTES } from "../../constants/routes";
import { STRINGS } from "../../constants/strings";

const statusOptions = [
  { name: "All", id: "" },
  { name: "Active", id: "1" },
  { name: "Disabled", id: "0" },
  { name: "Deleted", id: "-1" },
];

const userRoleMap = {
  super_admin: { color: 'success' },
  admin: { color: 'primary' },
  branch: { color: 'info' },
  employee: { color: 'secondary' },
  default: { color: 'default' },
};

const Users = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();
  const token = useRef(localStorage.getItem("token"));

  // State
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingSwitches, setLoadingSwitches] = useState({});
  const [pagination, setPagination] = useState({ current_page: 1, per_page: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [roleFilter, setRoleFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({ id: null, currentStatus: null, action: null });
  const roleFilterOptions = [{ label: 'All', value: '' }, ...roles];

  // Fetch roles
  useEffect(() => {
    (async () => {
      setLoadingRoles(true);
      try {
        const res = await fetch(apiConfig.SUPER_ADMIN.USER_ROLES, { headers: { Authorization: `Bearer ${token.current}` } });
        const data = await res.json();
        if (!data.success) throw new Error();
        setRoles(data.roles || []);
      } catch {
        setSnack({ open: true, severity: "error", message: "Failed to load roles" });
      } finally { setLoadingRoles(false); }
    })();
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        ...(statusFilter.id && { status: statusFilter.id }),
        ...(roleFilter && { role: roleFilter }),
        ...(searchTerm.trim() && { q: searchTerm.trim() })
      });
      const res = await fetch(`${apiConfig.SUPER_ADMIN.USERS_LIST}?${params}`, { headers: { Authorization: `Bearer ${token.current}` } });
      const data = await res.json();
      setUsers(data.users || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch {
      setSnack({ open: true, severity: "error", message: "Failed to load user data" });
    } finally { setLoading(false); }
  }, [pagination.current_page, pagination.per_page, statusFilter, roleFilter, searchTerm, token]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEditClick = user => {
    setEditModalOpen(true);
    setEditFormData({ ...user, role: user.role });
    setSelectedUser(user);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    const modifiedData = Object.keys(editFormData).reduce((acc, key) => {
      if (editFormData[key] !== selectedUser[key]) acc[key] = editFormData[key];
      return acc;
    }, {});
    if (!Object.keys(modifiedData).length) {
      setSnack({ open: true, severity: "info", message: "No changes to update" });
      setEditModalOpen(false); return;
    }
    try {
      const res = await fetch(apiConfig.SUPER_ADMIN.UPDATE_USER_DETAILS(selectedUser.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}` },
        body: JSON.stringify(modifiedData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);
      await fetchUsers();
      setSnack({ open: true, severity: "success", message: data.message || STRINGS.SUCCESS });
      setEditModalOpen(false);
    } catch (error) {
      setSnack({ open: true, severity: "error", message: error.message || "Failed to update user details" });
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    setConfirmPayload({ id, currentStatus, action: null });
    setConfirmModalOpen(true);
  };
  const handleDeleteClick = (id, currentStatus) => {
    setConfirmPayload({ id, currentStatus, action: "delete" });
    setConfirmModalOpen(true);
  };
  const handleConfirmToggle = useCallback(async () => {
    const { id, currentStatus, action } = confirmPayload;
    if (!id) return setConfirmModalOpen(false);
    setConfirmModalOpen(false);
    const newStatus = action === "delete" ? -1 : currentStatus === 1 ? 0 : 1;
    setLoadingSwitches(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(apiConfig.SUPER_ADMIN.UPDATE_USER_STATUS, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.current}` },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);
      await fetchUsers();
      setSnack({ open: true, severity: "success", message: data.message });
    } catch (error) {
      setSnack({ open: true, severity: "error", message: error.message || "Failed to update status" });
    } finally {
      setLoadingSwitches(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
    }
  }, [confirmPayload, fetchUsers]);

  // Confirmation modal content
  const confirmationModalContent = (
    <Box>
      {confirmPayload.action === "delete"
        ? STRINGS.CONFIRM_DELETE_USER_CONTENT(users.find(u => u.id === confirmPayload.id)?.name)
        : confirmPayload.currentStatus === 1
          ? STRINGS.CONFIRM_DISABLE_USER_CONTENT(users.find(u => u.id === confirmPayload.id)?.name)
          : STRINGS.CONFIRM_ENABLE_USER_CONTENT(users.find(u => u.id === confirmPayload.id)?.name)}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <ButtonComponent variant="text" onClick={() => setConfirmModalOpen(false)}>{STRINGS.CANCEL}</ButtonComponent>
        <ButtonComponent variant="text" onClick={handleConfirmToggle} autoFocus>{STRINGS.CONFIRM}</ButtonComponent>
      </Box>
    </Box>
  );

  // Table columns
  const columns = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "role_label",
      headerName: "Role",
      flex: 1,
      renderCell: (params) => {
        const roleValue = params.row.role;
        const roleLabel = params.value;
        const roleConfig = userRoleMap[roleValue] || userRoleMap.default;
        return <Chip label={roleLabel} color={roleConfig.color} size="small" variant="filled" sx={{ fontSize: 13, color: "white" }} />;
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        const key = String(params.value);
        const status = userStatusMap[key] || { label: "Unknown", color: "default" };
        return <Chip label={status.label} color={status.color} size="small" variant="filled" sx={{ fontSize: 13, color: "white" }} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const statusNum = Number(params.row.status);
        const isLoading = !!loadingSwitches[params.row.id];
        if (statusNum === -1) return null;
        return (
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", justifyContent: "center", width: "100%" }}>
            <Switch
              checked={statusNum === 1}
              onChange={() => !isLoading && handleToggleStatus(params.row.id, statusNum)}
              size="small"
              color="primary"
              disabled={isLoading}
            />
            <IconButtonComponent icon={EditIcon} onClick={() => handleEditClick(params.row)} title="Edit" />
            <IconButtonComponent icon={DeleteIcon} color="error" title="Delete" onClick={() => handleDeleteClick(params.row.id, params.row.status)} />
          </Box>
        );
      },
    },
  ];

  // Pagination, status, search handlers
  const handlePaginationChange = ({ page, rowsPerPage }) => setPagination(prev => ({ ...prev, current_page: page, per_page: rowsPerPage }));
  const handleStatusChange = e => { setStatusFilter(e.target.value || statusOptions[0]); setPagination(prev => ({ ...prev, current_page: 1 })); };
  const handleSearchChange = e => { const value = e.target.value; if (searchTimeout.current) clearTimeout(searchTimeout.current); searchTimeout.current = setTimeout(() => { setSearchTerm(value); setPagination(prev => ({ ...prev, current_page: 1 })); }, 300); };

  // Edit modal content
  const editModalContent = selectedUser && (
    <Box sx={{ p: 2 }}>
      <TextFieldComponent fullWidth label="Username" value={selectedUser.username} margin="normal" disabled />
      <TextFieldComponent fullWidth label="Name" value={editFormData.name} onChange={e => setEditFormData(prev => ({ ...prev, name: e.target.value }))} margin="normal" />
      <TextFieldComponent fullWidth label="Mobile" value={editFormData.mobile} onChange={e => setEditFormData(prev => ({ ...prev, mobile: e.target.value }))} margin="normal" />
      <TextFieldComponent fullWidth label="Email" value={editFormData.email} onChange={e => setEditFormData(prev => ({ ...prev, email: e.target.value }))} margin="normal" />
      <SelectFieldComponent
        label="Role"
        name="role"
        value={roles.find(roleOption => roleOption.value === editFormData.role) || null}
        onChange={e => { if (e.target.value) setEditFormData(prev => ({ ...prev, role: e.target.value.value })); }}
        options={roles}
        valueKey="value"
        displayKey="label"
        fullWidth
        margin="normal"
        disabled={loadingRoles}
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
        <ButtonComponent variant="outlined" onClick={() => setEditModalOpen(false)}>{STRINGS.CANCEL}</ButtonComponent>
        <ButtonComponent variant="contained" onClick={handleEditSubmit}>{STRINGS.SAVE_CHANGES}</ButtonComponent>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">All Users</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gap: 2, flexWrap: "wrap", mb: 2 }}>
        <Box sx={{ width: { xs: 120, sm: 170, md: 200 } }}>
          <SelectFieldComponent label="Status" name="status" value={statusFilter} onChange={handleStatusChange} options={statusOptions} valueKey="id" displayKey="name" fullWidth />
        </Box>
        <Box sx={{ width: { xs: 165, sm: 200, md: 250 } }}>
          <Autocomplete
            options={roleFilterOptions}
            getOptionLabel={role => role.label}
            value={roleFilterOptions.find(r => r.value === roleFilter) || null}
            onChange={(e, newVal) => setRoleFilter(newVal?.value || "")}
            sx={{ width: "100%" }}
            renderInput={params => <TextField {...params} label="Role" />}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            noOptionsText="No roles found"
            disabled={loadingRoles}
          />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: 300 } }}>
          <TextField label="Search" variant="outlined" fullWidth onChange={handleSearchChange} placeholder="Search users..." />
        </Box>
      </Box>
      <SnackbarAlert open={snack.open} onClose={() => setSnack(s => ({ ...s, open: false }))} severity={snack.severity} message={snack.message} />
      {loading ? <Loader message="Loading..." /> : <TableComponent rows={users} columns={columns} rowIdField="id" total={pagination.total} page={pagination.current_page - 1} rowsPerPage={pagination.per_page} onPaginationChange={handlePaginationChange} />}
      <Fab color="primary" aria-label="add" onClick={() => { if (role === "admin") navigate(ROUTES.ADMIN.CREATE_EMPLOYEE); else if (role === "super_admin") navigate(ROUTES.SUPER_ADMIN.CREATE_USER); }} sx={{ position: "fixed", bottom: 32, right: 32 }}><AddIcon /></Fab>
      <ModalComponent open={editModalOpen} onClose={() => setEditModalOpen(false)} title="User Details" content={editModalContent} />
      <ModalComponent open={confirmModalOpen} hideCloseIcon title={confirmPayload.currentStatus === 1 ? STRINGS.CONFIRM_DISABLE_USER_TITLE : STRINGS.ENABLE} content={confirmationModalContent} />
    </Box>
  );
};

export default Users;
