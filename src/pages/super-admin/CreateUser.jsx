import React, { useState } from "react";
import {
  Box,
  Typography,
  Divider,
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import Loader from "../../components/Loader";
import ModalComponent from "../../components/ModalComponent";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";

const CreateUser = () => {
  const [form, setForm] = useState({
    username: "",
    mobile: "",
    email: "",
    role: "branch",
    code: "",
    name: "",
    address: "",
    employee_code: "",
    designation_id: "",
    branch_id: "",
  });

  const [designations, setDesignations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "role" && value === "employee") {
      fetchDesignations();
      fetchBranches();
    }
  };

  const fetchDesignations = async () => {
    try {
      const res = await fetch(apiConfig.DESIGNATIONS, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setDesignations(data.designations || []);
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load designations.",
      });
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await fetch(apiConfig.MINIMAL_BRANCHES, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setBranches(data.branches || []);
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Failed to load branches.",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const payload = {
        username: form.username,
        mobile: form.mobile,
        email: form.email,
        role: form.role,
        ...(form.role === "branch" && {
          code: form.code,
          name: form.name,
          address: form.address,
        }),
        ...(form.role === "employee" && {
          employee_code: form.employee_code,
          name: form.name,
          designation_id: form.designation_id,
          branch_id: form.branch_id,
        }),
      };

      const res = await fetch(apiConfig.CREATE_USER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setSnack({
        open: true,
        severity: res.ok ? "success" : "error",
        message: data.message,
      });

      if (res.ok) {
        if (data.additional_info) {
          setAdditionalInfo(data.additional_info);
          setInfoModalOpen(true);
        }
        setForm({
          username: "",
          mobile: "",
          email: "",
          role: "branch",
          code: "",
          name: "",
          address: "",
          employee_code: "",
          designation_id: "",
          branch_id: "",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Something went wrong while creating the user.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Box sx={{ mx: "auto", my: 4, px: { xs: 2, md: 6 } }}>
      {submitLoading && <Loader message="Creating user..." />}
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Create New User
      </Typography>

      <form onSubmit={handleSubmit}>
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          User Role
        </Typography>
        <FormControl component="fieldset">
          <FormLabel component="legend">Role</FormLabel>
          <RadioGroup row name="role" value={form.role} onChange={handleChange}>
            <FormControlLabel value="admin" control={<Radio />} label="Admin" />
            <FormControlLabel
              value="branch"
              control={<Radio />}
              label="Branch"
            />
            <FormControlLabel
              value="employee"
              control={<Radio />}
              label="Employee"
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Basic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              name="mobile"
              label="Mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              required
              fullWidth
              type="email"
            />
          </Grid>
        </Grid>

        {form.role === "branch" && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
            >
              Branch Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextFieldComponent
                  name="code"
                  label="Branch Code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextFieldComponent
                  name="name"
                  label="Branch Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextFieldComponent
                  name="address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
          </>
        )}

        {form.role === "employee" && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="subtitle1"
              sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
            >
              Employee Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextFieldComponent
                  name="employee_code"
                  label="Employee Code"
                  value={form.employee_code}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextFieldComponent
                  name="name"
                  label="Employee Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectFieldComponent
                  name="designation_id"
                  label="Designation"
                  value={form.designation_id}
                  onChange={handleChange}
                  options={designations}
                  valueKey="id"
                  displayKey={(d) => d.designation}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <SelectFieldComponent
                  name="branch_id"
                  label="Branch"
                  value={form.branch_id}
                  onChange={handleChange}
                  options={branches}
                  valueKey="id"
                  displayKey={(b) => `${b.code} - ${b.name}`}
                  fullWidth
                  required
                />
              </Grid>
            </Grid>
          </>
        )}

        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitLoading}
          >
            {submitLoading ? "Creating..." : "Create User"}
          </Button>
        </Box>
      </form>

      <ModalComponent
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="User Credentials"
        content={
          <Box sx={{ whiteSpace: "pre-wrap", fontSize: 15 }}>
            {additionalInfo}
          </Box>
        }
        hideClose
      />
    </Box>
  );
};

export default CreateUser;
