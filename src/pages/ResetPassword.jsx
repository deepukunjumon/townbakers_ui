import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";
import TextFieldComponent from "../components/TextFieldComponent";
import SnackbarAlert from "../components/SnackbarAlert";
import apiConfig from "../config/apiConfig";
import { ROUTES } from "../constants/routes";

const ResetPassword = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  // Separate showPassword states for each field
  const [showPasswords, setShowPasswords] = useState({
    current_password: false,
    new_password: false,
    new_password_confirmation: false,
  });

  const handleClose = () => setSnack({ ...snack, open: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleShowPassword = (fieldName) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(apiConfig.RESET_PASSWORD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.password_reset_required) {
        localStorage.setItem("token", data.token);

        setSnack({
          open: true,
          severity: "info",
          message: "Password reset required. Redirecting...",
        });

        setTimeout(() => {
          navigate(ROUTES.RESET_PASSWORD);
        }, 1000);

        setLoading(false);
        return;
      }

      if (res.ok && data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Password updated successfully.",
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
          navigate("/");
        }, 1200);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Failed to reset password.",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            px: { xs: 2, sm: 4 },
            py: 4,
            mx: "auto",
            borderRadius: 2,
            boxShadow: 0,
            bgcolor: "background.default",
          }}
        >
          <SnackbarAlert {...snack} onClose={handleClose} />
          <Typography variant="h5" mb={3} textAlign="center">
            Reset Your Password
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextFieldComponent
              label="Current Password"
              name="current_password"
              type={showPasswords.current_password ? "text" : "password"}
              value={form.current_password}
              onChange={handleChange}
              required
              showPassword={showPasswords.current_password}
              setShowPassword={() => toggleShowPassword("current_password")}
              sx={{ mb: 2 }}
            />
            <TextFieldComponent
              label="New Password"
              name="new_password"
              type={showPasswords.new_password ? "text" : "password"}
              value={form.new_password}
              onChange={handleChange}
              required
              showPassword={showPasswords.new_password}
              setShowPassword={() => toggleShowPassword("new_password")}
              sx={{ mb: 2 }}
            />
            <TextFieldComponent
              label="Confirm New Password"
              name="new_password_confirmation"
              type={showPasswords.new_password_confirmation ? "text" : "password"}
              value={form.new_password_confirmation}
              onChange={handleChange}
              required
              showPassword={showPasswords.new_password_confirmation}
              setShowPassword={() => toggleShowPassword("new_password_confirmation")}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;