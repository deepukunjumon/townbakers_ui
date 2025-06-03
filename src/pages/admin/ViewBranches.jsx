import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Divider, Fab, CircularProgress, IconButton } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import ModalComponent from "../../components/ModalComponent";
import { useNavigate } from "react-router-dom";
import { getToken, getRoleFromToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import { ROUTES } from "../../constants/routes";
import Loader from "../../components/Loader";
import ChipComponent from "../../components/ChipComponent";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { STRINGS } from "../../constants/strings";
import TextFieldComponent from "../../components/TextFieldComponent";
import ButtonComponent from "../../components/ButtonComponent";

const ViewBranches = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const controllerRef = useRef(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
    });

    try {
      const res = await fetch(`${apiConfig.BRANCH_LIST}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success) {
        setBranches(data.branches || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to load branches",
        });
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load branches",
      });
    } finally {
      setLoading(false);
    }
  }, [pagination.current_page, pagination.per_page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleBranchClick = async (branchId) => {
    setModalLoading(true);
    setOpenModal(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const token = getToken();
      const res = await fetch(
        `${apiConfig.BRANCH_DETAILS.replace("{id}", branchId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        }
      );

      const data = await res.json();

      if (data.success) {
        setSelectedBranch(data.branch_details);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || STRINGS.FAILED_TO_LOAD,
        });
        setOpenModal(false);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setSnack({
          open: true,
          severity: "error",
          message: STRINGS.FAILED_TO_LOAD,
        });
        setOpenModal(false);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditClick = async (branch) => {
    setEditLoading(true);
    setEditModalOpen(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${apiConfig.BRANCH_DETAILS.replace("{id}", branch.id)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);
      setSelectedBranch(data.branch_details);
      setEditFormData(data.branch_details);
    } catch (error) {
      setSnack({ open: true, severity: "error", message: error.message || STRINGS.FAILED_TO_LOAD });
      setEditModalOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!selectedBranch) return;
    setEditLoading(true);
    try {
      const token = getToken();

      const modifiedData = Object.keys(editFormData).reduce((acc, key) => {
        if (editFormData[key] !== selectedBranch[key]) {
          acc[key] = editFormData[key];
        }
        return acc;
      }, {});

      if (Object.keys(modifiedData).length === 0) {
        setSnack({ open: true, severity: "info", message: "No changes to update" });
        setEditModalOpen(false);
        return;
      }

      const res = await fetch(apiConfig.UPDATE_BRANCH_DETAILS(selectedBranch.id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(modifiedData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || STRINGS.SOMETHING_WENT_WRONG);

      setBranches((prev) =>
        prev.map((branch) => (branch.id === selectedBranch.id ? { ...branch, ...modifiedData } : branch))
      );
      setSnack({ open: true, severity: "success", message: data.message || STRINGS.SUCCESS });
      setEditModalOpen(false);
    } catch (error) {
      setSnack({ open: true, severity: "error", message: error.message || STRINGS.FAILED_TO_UPDATE });
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { field: "code", headerName: "Code", flex: 1 },
    { field: "name", headerName: "Branch Name", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(params.row);
            }}
            color="primary"
            sx={{
              padding: 0.5,
              "& .MuiSvgIcon-root": { fontSize: "1.3rem" },
            }}
          >
            <EditIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const editModalContent = (
    <Box sx={{ p: 2 }}>
      {editLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : selectedBranch ? (
        <>
          <Box>
            <TextFieldComponent
              fullWidth
              label="Code"
              value={editFormData.code}
              onChange={(e) => setEditFormData(prev => ({ ...prev, code: e.target.value }))}
              margin="normal"
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
              label="Address"
              value={editFormData.address}
              onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
              margin="normal"
              multiline
              rows={2}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <TextFieldComponent
              fullWidth
              label="Mobile"
              value={editFormData.mobile}
              onChange={(e) => setEditFormData(prev => ({ ...prev, mobile: e.target.value }))}
              margin="normal"
            />
            <TextFieldComponent
              fullWidth
              label="Email"
              value={editFormData.email || ""}
              onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
              margin="normal"
            />
            <TextFieldComponent
              fullWidth
              label="Phone"
              value={editFormData.phone || ""}
              onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
              margin="normal"
            />
          </Box>
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
              disabled={editLoading}
            >
              {editLoading ? <CircularProgress size={24} /> : STRINGS.SAVE_CHANGES}
            </ButtonComponent>
          </Box>
        </>
      ) : null}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Branches
      </Typography>
      <Divider sx={{ mb: 2 }} />

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
          rows={branches}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
          onRowClick={(row) => handleBranchClick(row.id)}
        />
      )}

      <ModalComponent
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedBranch(null);
          setModalLoading(false);
          controllerRef.current?.abort();
        }}
        title="Branch Details"
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
          ) : selectedBranch ? (
            <Box>
              <Typography>
                <strong>Code:</strong> {selectedBranch.code}
              </Typography>
              <Typography>
                <strong>Name:</strong> {selectedBranch.name}
              </Typography>
              <Typography>
                <strong>Address:</strong> {selectedBranch.address}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Mobile:</strong> {selectedBranch.mobile}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedBranch.email || "-"}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedBranch.phone || "-"}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography>
                <strong>Status:</strong>{" "}
                <ChipComponent
                  size="small"
                  variant="filled"
                  label={selectedBranch.status === 1 ? "Active" : "Inactive"}
                  color={selectedBranch.status === 1 ? "success" : "default"}
                />
              </Typography>
              <Typography>
                <strong>Active Employees:</strong>{" "}
                {selectedBranch.active_employees_count}
              </Typography>
            </Box>
          ) : null
        }
      />

      <ModalComponent
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Branch"
        content={editModalContent}
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
            navigate(ROUTES.ADMIN.CREATE_BRANCH);
          }
          if (role === "super_admin") {
            navigate(ROUTES.SUPER_ADMIN.CREATE_BRANCH);
          }
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ViewBranches;
