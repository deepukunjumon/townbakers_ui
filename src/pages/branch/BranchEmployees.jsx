import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Divider, TextField, Fab } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import Loader from "../../components/Loader";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import AddIcon from "@mui/icons-material/Add";
import { ROUTES } from "../../constants/routes";
import { useNavigate } from "react-router-dom";

const BranchEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);
  const controllerRef = useRef(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const fetchEmployees = useCallback(
    async (search = "") => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const token = localStorage.getItem("token");
      const newController = new AbortController();
      controllerRef.current = newController;

      setLoading(true);

      try {
        const params = new URLSearchParams({
          page: pagination.current_page,
          per_page: pagination.per_page,
          search: search.trim(),
        }).toString();

        const res = await fetch(
          `${apiConfig.BRANCH_EMPLOYEES}?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: newController.signal,
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setEmployees(data.employees || []);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
          }));
        } else {
          throw new Error(data.message || "Failed to load employee data");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnack({
            open: true,
            severity: "error",
            message: error.message || "Failed to load employee data",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page]
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

  const columns = [
    { field: "employee_code", headerName: "Employee Code", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
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
    <Box sx={{ maxWidth: "auto", mx: "auto", p: 2 }}>
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
          width: "100%",
        }}
      >
        <Box sx={{ width: 300 }}>
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
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          navigate(ROUTES.BRANCH.CREATE_EMPLOYEE);
        }}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1300,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default BranchEmployees;
