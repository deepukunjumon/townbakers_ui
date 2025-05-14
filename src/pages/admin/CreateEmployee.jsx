import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
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
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${apiConfig.BASE_URL}/admin/create/employee`, {
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
        <SelectFieldComponent
          label="Designation"
          name="designation_id"
          value={form.designation_id}
          onChange={(e) => setForm({ ...form, designation_id: e.target.value })}
          options={designations}
          valueKey="id"
          displayKey={(des) => des.designation}
          required
          fullWidth
        />
        <SelectFieldComponent
          label="Branch"
          name="branch_id"
          value={form.branch_id}
          onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
          options={branches}
          valueKey="id"
          displayKey={(branch) => `${branch.code} - ${branch.name}`}
          required
          fullWidth
        />
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
