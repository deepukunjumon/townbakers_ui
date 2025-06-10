import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Chip,
    Divider,
    TextField,
    Switch,
    Fab,
    CircularProgress,
    Avatar,
    Autocomplete,
} from "@mui/material";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
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
import ExportMenu from "../../components/ExportMenu";
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

const Users = () => {
    const navigate = useNavigate();
    const role = getRoleFromToken();
    const token = useRef(localStorage.getItem("token"));

    // Data states
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [designations, setDesignations] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [loadingDesignations, setLoadingDesignations] = useState(true);
    const [loadingSwitches, setLoadingSwitches] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    // Pagination & filters
    const [pagination, setPagination] = useState({
        current_page: 1,
        per_page: 10,
        total: 0,
    });
    const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
    const [roleFilter, setRoleFilter] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const searchTimeout = useRef(null);

    // Snack alert
    const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });

    // Export menu
    const [anchorEl, setAnchorEl] = useState(null);
    const menuOpen = Boolean(anchorEl);

    // Confirmation modal
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({ id: null, currentStatus: null, action: null });

    // Edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Edit form data state
    const [editFormData, setEditFormData] = useState({});

    // Fetch roles on mount
    useEffect(() => {
        const fetchRoles = async () => {
            setLoadingRoles(true);
            try {
                const res = await fetch(apiConfig.USER_ROLES, {
                    headers: { Authorization: `Bearer ${token.current}` },
                });
                const data = await res.json();
                if (!data.success) throw new Error("Invalid data");
                setRoles(data.roles || []);
            } catch {
                setSnack({ open: true, severity: "error", message: "Failed to load roles" });
            } finally {
                setLoadingRoles(false);
            }
        };
        fetchRoles();
    }, []);

    // Fetch designations on mount
    useEffect(() => {
        const fetchDesignations = async () => {
            setLoadingDesignations(true);
            try {
                const res = await fetch(apiConfig.ACTIVE_DESIGNATIONS, {
                    headers: { Authorization: `Bearer ${token.current}` },
                });
                const data = await res.json();
                if (!data.success) throw new Error(data.message || "Invalid designations data");

                const designationsList = Array.isArray(data.designations)
                    ? data.designations
                    : Array.isArray(data.data)
                        ? data.data
                        : [];
                setDesignations(designationsList);
            } catch (error) {
                console.error("Error fetching designations:", error);
                setSnack({ open: true, severity: "error", message: "Failed to load designations data" });
            } finally {
                setLoadingDesignations(false);
            }
        };
        fetchDesignations();
    }, []);

    // Fetch users when filters or pagination changes
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                params.append("page", pagination.current_page);
                params.append("per_page", pagination.per_page);
                if (statusFilter.id) params.append("status", statusFilter.id);
                if (roleFilter) params.append("branch_id", roleFilter);
                if (searchTerm.trim()) params.append("q", searchTerm.trim());

                const url = `${apiConfig.SUPER_ADMIN.USERS_LIST}?${params.toString()}`;
                const res = await fetch(url, {
                    headers: { Authorization: `Bearer ${token.current}` },
                });
                const data = await res.json();
                setUsers(data.users || []);
                setPagination((prev) => ({
                    ...prev,
                    total: data.pagination?.total || 0,
                    current_page: data.pagination?.current_page || 1,
                    per_page: data.pagination?.per_page || 10,
                }));
            } catch {
                setSnack({ open: true, severity: "error", message: "Failed to load employee data" });
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [pagination.current_page, pagination.per_page, statusFilter, roleFilter, searchTerm]);

    // Toggle status confirmation
    const handleToggleStatus = useCallback((id, currentStatus) => {
        setConfirmModalOpen(true);
        setConfirmPayload({ id, currentStatus, action: "toggle" });
    }, []);

    // Edit employee click
    const handleEditClick = useCallback(async (employee) => {
        setEditLoading(true);
        setEditModalOpen(true);
        try {
            const res = await fetch(apiConfig.EMPLOYEE_DETAILS(employee.id), {
                headers: { Authorization: `Bearer ${token.current}` },
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);
            setSelectedEmployee(data.employee);
            setEditFormData(data.employee);
        } catch (error) {
            setSnack({ open: true, severity: "error", message: error.message || "Failed to load employee details" });
            setEditModalOpen(false);
        } finally {
            setEditLoading(false);
        }
    }, []);

    // Submit edited employee details
    const handleEditSubmit = useCallback(async () => {
        if (!selectedEmployee) return;
        setEditLoading(true);
        try {
            const modifiedData = Object.keys(editFormData).reduce((acc, key) => {
                if (editFormData[key] !== selectedEmployee[key]) {
                    acc[key] = editFormData[key];
                }
                return acc;
            }, {});

            if (Object.keys(modifiedData).length === 0) {
                setSnack({ open: true, severity: "info", message: "No changes to update" });
                setEditModalOpen(false);
                return;
            }

            const res = await fetch(apiConfig.UPDATE_EMPLOYEE_DETAILS(selectedEmployee.id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.current}`,
                },
                body: JSON.stringify(modifiedData),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);

            setUsers((prev) =>
                prev.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, ...modifiedData } : emp))
            );
            setSnack({ open: true, severity: "success", message: data.message || STRINGS.SUCCESS });
            setEditModalOpen(false);
        } catch (error) {
            setSnack({ open: true, severity: "error", message: error.message || "Failed to update employee details" });
        } finally {
            setEditLoading(false);
        }
    }, [selectedEmployee, editFormData]);

    // Delete confirmation
    const handleDeleteClick = useCallback((id) => {
        setConfirmModalOpen(true);
        setConfirmPayload({ id, currentStatus: 1, action: "delete" });
    }, []);

    // Confirm toggle or delete action
    const handleConfirmToggle = useCallback(async () => {
        const { id, currentStatus, action } = confirmPayload;
        if (!id) {
            setConfirmModalOpen(false);
            return;
        }

        setConfirmModalOpen(false);
        const newStatus = action === "delete" ? -1 : currentStatus === 1 ? 0 : 1;
        setLoadingSwitches((prev) => ({ ...prev, [id]: true }));

        try {
            const res = await fetch(apiConfig.UPDATE_EMPLOYEE_STATUS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token.current}`,
                },
                body: JSON.stringify({ id, status: newStatus }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);

            setUsers((prev) =>
                prev.map((emp) => (emp.id === id ? { ...emp, status: newStatus } : emp))
            );

            setSnack({ open: true, severity: "success", message: data.message });
        } catch (error) {
            setSnack({ open: true, severity: "error", message: error.message || "Failed to update status" });
        } finally {
            setLoadingSwitches((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });
        }
    }, [confirmPayload]);

    // Confirmation modal content
    const confirmationModalContent = (
        <Box>
            {confirmPayload.action === "delete"
                ? STRINGS.DELETE_EMPLOYEE_CONFIRMATION
                : confirmPayload.currentStatus === 1
                    ? STRINGS.DISABLE_EMPLOYEE_CONFIRMATION
                    : STRINGS.ENABLE_EMPLOYEE_CONFIRMATION}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <ButtonComponent variant="text" onClick={() => setConfirmModalOpen(false)}>
                    {STRINGS.CANCEL}
                </ButtonComponent>
                <ButtonComponent variant="text" onClick={handleConfirmToggle} autoFocus>
                    {STRINGS.CONFIRM}
                </ButtonComponent>
            </Box>
        </Box>
    );

    // Edit modal content
    const editModalContent = (
        <Box sx={{ p: 2 }}>
            {editLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : selectedEmployee ? (
                <>
                    <TextFieldComponent
                        fullWidth
                        label="Employee Code"
                        value={selectedEmployee.employee_code}
                        margin="normal"
                        disabled={true}
                    />
                    <TextFieldComponent
                        fullWidth
                        label="Name"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        margin="normal"
                    />
                    <TextFieldComponent
                        fullWidth
                        label="Mobile"
                        value={editFormData.mobile}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, mobile: e.target.value }))}
                        margin="normal"
                    />
                    <SelectFieldComponent
                        label="Role"
                        name="role"
                        value={roles.find(b => b.id === editFormData.role_value) || null}
                        onChange={(e) => {
                            if (e.target.value) {
                                setEditFormData(prev => ({ ...prev, role_value: e.target.value.id }));
                            }
                        }}
                        options={roles}
                        valueKey="value"
                        displayKey={`${role.label}`}
                        fullWidth
                        margin="normal"
                        disabled={loadingRoles}
                    />
                    <SelectFieldComponent
                        label="Designation"
                        name="designation"
                        value={designations.find(d => d.id === editFormData.designation_id) || null}
                        onChange={(e) => {
                            if (e.target.value) {
                                setEditFormData(prev => ({ ...prev, designation_id: e.target.value.id }));
                            }
                        }}
                        options={designations}
                        valueKey="id"
                        displayKey="designation"
                        fullWidth
                        margin="normal"
                        disabled={loadingDesignations}
                    />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
                        <ButtonComponent
                            variant="outlined"
                            onClick={() => setEditModalOpen(false)}
                            disabled={editLoading}
                        >
                            {STRINGS.CANCEL}
                        </ButtonComponent>
                        <ButtonComponent
                            variant="contained"
                            onClick={handleEditSubmit}
                            disabled={editLoading || loadingDesignations}
                        >
                            {editLoading ? <CircularProgress size={24} /> : STRINGS.SAVE_CHANGES}
                        </ButtonComponent>
                    </Box>
                </>
            ) : null}
        </Box>
    );

    const columns = [
        { field: "username", headerName: "Username", flex: 1 },
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
        { field: "email", headerName: "Email", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => {
                const key = String(params.value);
                const status = userStatusMap[key] || { label: "Unknown", color: "default" };
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

                if (statusNum === -1) {
                    return role === "super_admin" ? (
                        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", justifyContent: "center", width: "100%" }}>
                            <IconButtonComponent
                                icon={ArrowCircleLeftIcon}
                                onClick={() => handleToggleStatus(params.row.id, statusNum)}
                                loading={isLoading}
                                title="Re-enable"
                            />
                        </Box>
                    ) : null;
                }

                return (
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", justifyContent: "center", width: "100%" }}>
                        <Switch
                            checked={statusNum === 1}
                            onChange={() => !isLoading && handleToggleStatus(params.row.id, statusNum)}
                            size="small"
                            color="primary"
                            disabled={isLoading}
                        />
                        <IconButtonComponent
                            icon={EditIcon}
                            onClick={() => handleEditClick(params.row)}
                            title="Edit"
                        />
                        <IconButtonComponent
                            icon={DeleteIcon}
                            onClick={() => handleDeleteClick(params.row.id)}
                            color="error"
                            title="Delete"
                        />
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
        form.action = apiConfig.ALL_Users_LIST;

        const addField = (name, value) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            form.appendChild(input);
        };

        if (token.current) addField("token", token.current);
        addField("status", statusFilter.id || "");
        addField("role", roleFilter || "");
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
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Search input change with debounce
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
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h5">All Users</Typography>
                <ExportMenu
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleExportClose}
                    onExportClick={handleExportClick}
                    disabled={users.length === 0}
                />
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: { xs: "flex-start", md: "flex-end" },
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

                {/* <Box sx={{ width: { xs: 165, sm: 200, md: 250 } }}>
                    <Autocomplete
                        options={branches}
                        getOptionLabel={(o) => `${o.code} - ${o.name}`}
                        value={branches.find((b) => b.id === roleFilter) || null}
                        onChange={(e, newVal) => setBranchFilter(newVal?.id || null)}
                        sx={{ width: "100%" }}
                        renderInput={(params) => <TextField {...params} label="Branch" />}
                        disabled={loadingBranches}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        noOptionsText="No branches found"
                    />
                </Box> */}

                <Box sx={{ width: { xs: "100%", sm: 300 } }}>
                    <TextField
                        label="Search"
                        variant="outlined"
                        fullWidth
                        onChange={handleSearchChange}
                        placeholder="Search users..."
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
                    rows={users}
                    columns={columns}
                    rowIdField="id"
                    total={pagination.total}
                    page={pagination.current_page - 1}
                    rowsPerPage={pagination.per_page}
                    onPaginationChange={handlePaginationChange}
                />
            )}

            <Fab
                color="primary"
                aria-label="add"
                onClick={() => {
                    if (role === "admin") {
                        navigate(ROUTES.ADMIN.CREATE_EMPLOYEE);
                    } else if (role === "super_admin") {
                        navigate(ROUTES.SUPER_ADMIN.CREATE_EMPLOYEE);
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
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title="Employee Details"
                content={editModalContent}
            />

            <ModalComponent
                open={confirmModalOpen}
                onClose={() => { }}
                hideCloseIcon
                title={STRINGS.CONFIRM_ACTION}
                content={confirmationModalContent}
            />
        </Box>
    );
};

export default Users;
