import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Divider, Fab, CircularProgress } from "@mui/material";
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

const ViewBranches = () => {
  const navigate = useNavigate();
  const role = getRoleFromToken();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const controllerRef = useRef(null); // NEW: reference to cancel API call

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
    });

    try {
      const res = await fetch(`${apiConfig.MINIMAL_BRANCHES}?${params}`, {
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
          message: data.message || "Failed to load branch details",
        });
        setOpenModal(false);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load branch details",
        });
        setOpenModal(false);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const columns = [
    { field: "code", headerName: "Code", flex: 1 },
    { field: "name", headerName: "Branch Name", flex: 1 },
  ];

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
