import React, { useEffect, useState } from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import TableComponent from "../../components/TableComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";
import { userStatusMap } from "../../constants/status";

const AllEmployees = () => {
  const branchId = getBranchIdFromToken();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    fetch(
      `${apiConfig.ALL_EMPLOYEES_LIST}?page=${pagination.current_page}&per_page=${pagination.per_page}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
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
  }, [branchId, pagination.current_page, pagination.per_page]);

const columns = [
  { field: "employee_code", headerName: "Employee Code", flex: 1 },
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
        />
      );
    },
  },
  ];

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        All Employees
      </Typography>
      <Divider sx={{ m: 2 }} />
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
    </Box>
  );
};

export default AllEmployees;
