import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography} from "@mui/material";
import TextFieldComponent from "../components/TextFieldComponent";
import SnackbarAlert from "../components/SnackbarAlert";
import apiConfig from "../config/apiConfig";
import { ROUTES } from "../constants/routes";
import ButtonComponent from "../components/ButtonComponent";

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
        minHeight: '70vh',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            mb: 4,
            fontWeight: 500,
            textAlign: "center"
          }}
        >
          Reset Your Password
        </Typography>

        <SnackbarAlert {...snack} onClose={handleClose} />

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextFieldComponent
            label="Current Password"
            name="current_password"
            type={showPasswords.current_password ? "text" : "password"}
            value={form.current_password}
            onChange={handleChange}
            required
            showPassword={showPasswords.current_password}
            setShowPassword={() => toggleShowPassword("current_password")}
            sx={{ mb: 2.5 }}
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
            sx={{ mb: 2.5 }}
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
            sx={{ mb: 3 }}
          />
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            width: '100%'
          }}>
            <ButtonComponent
              type="button"
              variant="outlined"
              onClick={() => navigate(-1, { replace: true })}
              sx={{
                flex: 1
              }}
            >
              Cancel
            </ButtonComponent>
            <ButtonComponent
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                flex: 1
              }}
            >
              {loading ? "Updating..." : "Update Password"}
            </ButtonComponent>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default ResetPassword;