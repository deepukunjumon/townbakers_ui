import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";

const BranchEmployees = () => {
  const branchId = getBranchIdFromToken();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, [branchId, pagination.current_page, pagination.per_page]);

  const fetchEmployees = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      console.log("Fetching employees with payload:", {
        page: pagination.current_page,
        per_page: pagination.per_page,
      });

      const res = await fetch(
        `${apiConfig.BASE_URL}/branch/employees?page=${pagination.current_page}&per_page=${pagination.per_page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok) {
        setEmployees(data.employees || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
        }));
      } else {
        throw new Error(data.message || "Failed to load employee data");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to load employee data",
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