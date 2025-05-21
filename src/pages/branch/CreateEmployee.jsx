import React, { useEffect, useState } from "react";
import { Box, Typography, Divider } from "@mui/material";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        const res = await fetch(`${apiConfig.BASE_URL}/designations`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setDesignations(data.designations || []);
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
    setLoading(true);

    const branch_id = getBranchIdFromToken();
    if (!branch_id) {
      setSnack({
        open: true,
        severity: "error",
        message: "Branch ID missing in token.",
      });
      setLoading(false);
      return;
    }

    // Ensure only the ID is sent
    const payload = {
      ...form,
      branch_id,
      designation_id:
        typeof form.designation_id === "object" && form.designation_id !== null
          ? form.designation_id.id
          : form.designation_id,
    };

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", px: 2, py: 4 }}>
      {loading && <Loader message="Creating employee..." />}
      <Typography variant="h5" gutterBottom>
        Add Employee
      </Typography>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

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
          onChange={(e) => setForm({ ...form, designation_id: e.target.value.id })}
          options={designations}
          valueKey="id"
          displayKey={(des) => des.designation}
          required
        />

        <ButtonComponent
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
        >
          Create Employee
        </ButtonComponent>
      </form>
    </Box>
  );
};

export default CreateEmployee;
