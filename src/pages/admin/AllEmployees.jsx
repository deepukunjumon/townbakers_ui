import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";

const AllEmployees = () => {
  const branchId = getBranchIdFromToken();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch(`${apiConfig.BASE_URL}/branch/employees`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
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
  }, [branchId]);

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
        <TableComponent rows={employees} columns={columns} rowIdField="id" />
      )}
    </Box>
  );
};

export default AllEmployees;
