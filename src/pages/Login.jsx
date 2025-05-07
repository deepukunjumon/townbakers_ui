import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Button,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { ROUTES } from "../constants/routes";
import apiConfig from "../config/apiConfig";
import TextFieldComponent from "../components/TextFieldComponent";
import SnackbarAlert from "../components/SnackbarAlert";
import login_page_image from "../assets/images/login_page_image.svg";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const handleClose = () => setSnack((prev) => ({ ...prev, open: false }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSnack({ open: false, severity: "success", message: "" });

    try {
      const res = await fetch(apiConfig.LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Login successful!",
        });

        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        const role = decoded.role || "user";

        setTimeout(() => {
          setSnack((prev) => ({ ...prev, open: false }));
          if (role === "admin") navigate(ROUTES.ADMIN.DASHBOARD);
          else if (role === "branch") navigate(ROUTES.BRANCH.DASHBOARD);
        }, 1000);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Login failed.",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    }
    setLoading(false);
  };

  return (
    <Grid
      container
      sx={{
        minHeight: "100vh",
        maxWidth: "1600px",
        mx: "auto",
        px: { xs: 6, sm: 18, md: 16 },
      }}
    >
      <SnackbarAlert
        open={snack.open}
        onClose={handleClose}
        severity={snack.severity}
        message={snack.message}
      />

      {/* Right Side - Illustration and Heading */}
      {!isMobile && (
        <Grid
          item
          md={6}
          display={{ xs: "none", md: "flex" }}
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          sx={{
            pr: { md: 10 },
            pl: { md: 6 },
            display: { xs: "none", md: "flex" }, // ensure correct hiding
          }}        >
          <Box
            component="img"
            src={login_page_image}
            alt="Login Illustration"
            sx={{ width: "100%", maxWidth: 480, ml: 4 }}
          />
        </Grid>
      )}

      {/* Left Side - Login Form */}
      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        sx={{ pl: { xs: 3, md: 12 }, pr: { md: 5 } }}
      >
        <Box sx={{ width: "100%", maxWidth: 360 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64, mb: 1 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight={600}>
              Sign in
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <TextFieldComponent
              label="Login ID"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextFieldComponent
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3 }}
            >
              {loading ? "Logging in..." : "SIGN IN"}
            </Button>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;
