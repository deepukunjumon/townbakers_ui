import React, { useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Divider,
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
    role: "admin",
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
      const res = await fetch(apiConfig.ACTIVE_DESIGNATIONS, {
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
        name: form.name,
        mobile: form.mobile,
        email: form.email,
        role: form.role,
        ...(form.role === "admin" && { username: form.username }),
        ...(form.role === "branch" && {
          code: form.code,
          address: form.address,
          username: form.code,
        }),
        ...(form.role === "employee" && {
          employee_code: form.employee_code,
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
          name: "",
          mobile: "",
          phone: "",
          email: "",
          role: "admin",
          code: "",
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
    <Box sx={{ mx: "auto", my: 3, px: { xs: 2, md: 6 }, maxWidth: 600 }}>
      {submitLoading && <Loader message="Loading..." />}
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Create New User
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <form onSubmit={handleSubmit}>
        <FormControl component="fieldset" sx={{ mb: 3, display: "block" }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>
            Role
          </FormLabel>
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

        {/* Username only for admin */}
        {form.role === "admin" && (
          <Box sx={{ mb: 3 }}>
            <TextFieldComponent
              name="username"
              label="Username"
              value={form.username}
              onChange={handleChange}
              required
              fullWidth
            />
          </Box>
        )}

        {/* Branch role fields */}
        {form.role === "branch" && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="code"
                label="Branch Code"
                value={form.code}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="name"
                label="Branch Name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="address"
                label="Branch Address"
                value={form.address}
                onChange={handleChange}
                required
                fullWidth
                multiline
                rows={4}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                type="mobile"
                name="mobile"
                label="Mobile"
                value={form.mobile}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                type="phone"
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                type="email"
                required
              />
            </Box>
          </>
        )}

        {/* Admin or Employee role */}
        {(form.role === "admin" || form.role === "employee") && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="name"
                label="Name"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                type="mobile"
                name="mobile"
                label="Mobile"
                value={form.mobile}
                onChange={handleChange}
                inputProps={{ maxLength: 10 }}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="email"
                label="Email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                type="email"
              />
            </Box>
          </>
        )}

        {/* Employee-specific fields */}
        {form.role === "employee" && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextFieldComponent
                name="employee_code"
                label="Employee Code"
                value={form.employee_code}
                onChange={handleChange}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <SelectFieldComponent
                label="Designation"
                name="designation_id"
                value={
                  designations.find((d) => d.id === form.designation_id) || null
                }
                onChange={(e) =>
                  setForm({ ...form, designation_id: e.target.value.id })
                }
                options={designations}
                valueKey="id"
                displayKey="designation"
                required
                fullWidth
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <SelectFieldComponent
                name="branch_id"
                label="Branch"
                value={branches.find((b) => b.id === form.branch_id) || null}
                onChange={(e) =>
                  setForm({ ...form, branch_id: e.target.value.id })
                }
                options={branches}
                valueKey="id"
                displayKey={(b) => `${b.code} - ${b.name}`}
                required
                fullWidth
              />
            </Box>
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitLoading}
            fullWidth
          >
            {submitLoading ? "Submitting..." : "Submit"}
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