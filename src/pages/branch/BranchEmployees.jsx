import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Divider } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";
import SearchFieldComponent from "../../components/SearchFieldComponent";

const BranchEmployees = () => {
  const branchId = getBranchIdFromToken();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [controller, setController] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchEmployees(searchTerm);
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, pagination.current_page, pagination.per_page]);

  const fetchEmployees = async (search = "") => {
    if (controller) controller.abort();

    const token = localStorage.getItem("token");
    const newController = new AbortController();
    setController(newController);

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current_page,
        per_page: pagination.per_page,
        search: search.trim(),
      }).toString();

      const res = await fetch(
        `${apiConfig.BASE_URL}/branch/employees?${params}`,
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
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const columns = [
    { field: "employee_code", headerName: "Employee Code", flex: 1 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "mobile", headerName: "Mobile", flex: 1 },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Branch Employees
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
          maxWidth: 1200,
          width: "100%",
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: 350 } }}>
          <SearchFieldComponent
            onDebouncedChange={(value) => {
              setSearchTerm(value);
              setPagination((prev) => ({ ...prev, current_page: 1 }));
            }}
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
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
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
    </Box>
  );
};

export default BranchEmployees;
