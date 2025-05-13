import React, { useState } from "react";
import { Box, Grid, Button, Typography } from "@mui/material";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";

const initialState = {
  code: "",
  name: "",
  address: "",
  mobile: "",
  phone: "",
  email: "",
};

const CreateBranch = () => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch(apiConfig.CREATE_BRANCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSnack({ open: true, message: data.message, severity: "success" });
        setForm(initialState);
      } else {
        setSnack({
          open: true,
          message: data.message || "Failed to create branch",
          severity: "error",
        });
        if (data.errors) setErrors(data.errors);
      }
    } catch (error) {
      setSnack({ open: true, message: "Server error", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: { sm: 500, md: 850 }, mx: "auto", py: 4, px: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create Branch
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2} direction="column">
          <Grid
            container
            item
            xs={12}
            spacing={2}
            direction={{ xs: "column", md: "row" }}
          >
            <Grid item xs={12} md={4}>
              <TextFieldComponent
                label="Branch Code"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                error={!!errors.code}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextFieldComponent
                sx={{ width: { md: 592 } }}
                label="Branch Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                error={!!errors.name}
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              multiline
              minRows={3}
              error={!!errors.address}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Mobile"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              inputProps={{ maxLength: 10 }}
              error={!!errors.mobile}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              inputProps={{ maxLength: 15 }}
              error={!!errors.phone}
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              error={!!errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Branch"}
            </Button>
          </Grid>
        </Grid>
      </Box>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />
    </Box>
  );
};

export default CreateBranch;
