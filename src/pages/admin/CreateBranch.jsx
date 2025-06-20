import React, { useState } from "react";
import { Box, Grid, Button, Typography, Divider } from "@mui/material";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";
import Loader from "../../components/Loader";
import ModalComponent from "../../components/ModalComponent";

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
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [additionalInfo, setAdditionalInfo] = useState("");

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
        if (data.additional_info) {
          setAdditionalInfo(data.additional_info);
          setInfoModalOpen(true);
        }
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

  const isFormValid = () => {
    return form.code && form.name && form.address && form.mobile;
  };

  return (
    <Box sx={{ maxWidth: { xs: "100%", md: 600 }, mx: "auto" }}>
      {loading && <Loader message="Creating branch..." />}
      <Typography variant="h5" gutterBottom>
        Create Branch
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={2} direction="column">
          <Grid
            container
            item
            xs={12}
            spacing={2}
            direction={{ xs: "column", sm: "row" }}
          >
            <Grid item xs={12} md={4}>
              <TextFieldComponent
                sx={{ width: { sm: 250, md: 200 } }}
                label="Branch Code"
                name="code"
                value={form.code}
                onChange={handleChange}
                required
                error={!!errors.code}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextFieldComponent
                sx={{ width: { sm: 430, md: 380 } }}
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
              required
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
              disabled={loading || !isFormValid()}
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

      <ModalComponent
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Additional Information"
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

export default CreateBranch;
