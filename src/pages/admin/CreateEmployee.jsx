import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Typography, MenuItem } from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";

const CreateEmployeeByAdmin = () => {
  const [form, setForm] = useState({
    employee_code: "",
    name: "",
    mobile: "",
    designation_id: "",
    branch_id: "",
  });

  const [branches, setBranches] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${apiConfig.BASE_URL}/branches/minimal`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setBranches(data.branches || []);
        else throw new Error();
      } catch {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to fetch branches",
        });
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await fetch(`${apiConfig.BASE_URL}/designations`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setDesignations(data.data || []);
        else throw new Error();
      } catch {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to fetch designations",
        });
      }
    };

    fetchBranches();
    fetchDesignations();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiConfig.BASE_URL}/create/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setSnack({
        open: true,
        severity: res.ok ? "success" : "error",
        message: data.message || "Error creating employee",
      });

      if (res.ok) {
        setForm({
          employee_code: "",
          name: "",
          mobile: "",
          designation_id: "",
          branch_id: "",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Error submitting form",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" gutterBottom>
        Create New Employee
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          name="employee_code"
          label="Employee Code"
          value={form.employee_code}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="name"
          label="Name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="mobile"
          label="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />

        <TextField
          select
          name="designation_id"
          label="Designation"
          value={form.designation_id || ""}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {designations.length === 0 ? (
            <MenuItem disabled>Loading designations...</MenuItem>
          ) : (
            designations.map((des) => (
              <MenuItem key={des.id} value={des.id}>
                {des.designation}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          select
          name="branch_id"
          label="Branch"
          value={form.branch_id}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        >
          {branches.length === 0 ? (
            <MenuItem disabled>Loading branches...</MenuItem>
          ) : (
            branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
        >
          Create Employee
        </Button>
      </form>
    </Box>
  );
};

export default CreateEmployeeByAdmin;
