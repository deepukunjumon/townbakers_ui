import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import ModalComponent from "../../components/ModalComponent";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/auth";
import apiConfig from "../../config/apiConfig";
import { ROUTES } from "../../constants/routes";

const ViewBranches = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchBranches();
  }, [pagination.current_page, pagination.per_page]);

  const fetchBranches = async () => {
    setLoading(true);
    const token = getToken();

    const params = new URLSearchParams({
      page: pagination.current_page,
      per_page: pagination.per_page,
    });

    try {
      const res = await fetch(
        `${apiConfig.BASE_URL}/branches/minimal?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleBranchClick = (branchId) => {
    const branch = branches.find((b) => b.id === branchId);
    setSelectedBranch(branch);
    setOpenModal(true);
  };

  const columns = [
    { field: "code", headerName: "Code", flex: 1 },
    { field: "name", headerName: "Branch Name", flex: 1 },
    { field: "address", headerName: "Address", flex: 2 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Branches List
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableComponent
          rows={branches}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1} // Convert 1-based to 0-based index
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
        }}
        title="Branch Details"
        content={
          selectedBranch ? (
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
              <Typography>
                <strong>Mobile:</strong> {selectedBranch.mobile}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedBranch.email || "N/A"}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {selectedBranch.phone || "N/A"}
              </Typography>
              <Typography>
                <strong>Status:</strong>{" "}
                {selectedBranch.status === 1 ? "Active" : "Inactive"}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )
        }
      />

      <Button
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: 30,
          right: 30,
          borderRadius: "50%",
          fontSize: 35,
          height: 56,
          minWidth: 0,
          boxShadow: 3,
        }}
        onClick={() => {
          navigate(ROUTES.ADMIN.CREATE_BRANCH);
        }}
      >
        +
      </Button>
    </Box>
  );
};

export default ViewBranches;
