import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  Paper,
  Divider,
} from "@mui/material";
import TextFieldComponent from "../../components/TextFieldComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";
import ButtonComponent from "../../components/ButtonComponent";

const CreateEmployee = () => {
  const [form, setForm] = useState({
    employee_code: "",
    name: "",
    mobile: "",
    designation_id: "",
  });

  const [designations, setDesignations] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
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

    fetchDesignations();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const branch_id = getBranchIdFromToken();
    if (!branch_id) {
      setSnack({
        open: true,
        severity: "error",
        message: "Branch ID missing in token.",
      });
      return;
    }

    const payload = { ...form, branch_id };

    try {
      const res = await fetch(`${apiConfig.BASE_URL}/branch/create/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify(payload),
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
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Branch Employees
      </Typography>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Paper elevation={3} sx={{ p: 4 }}>
        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextFieldComponent
            name="employee_code"
            label="Employee Code"
            value={form.employee_code}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextFieldComponent
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextFieldComponent
            name="mobile"
            label="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextFieldComponent
            name="designation_id"
            label="Designation"
            type="select"
            value={form.designation_id || ""}
            onChange={handleChange}
            required
            fullWidth
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
          </TextFieldComponent>

          <ButtonComponent
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
          >
            Create Employee
          </ButtonComponent>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateEmployee;
