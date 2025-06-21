import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Typography,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
  Link,
} from "@mui/material";
import { STRINGS } from "../constants/strings";
import FooterComponent from "../components/FooterComponent";
import ButtonComponent from "../components/ButtonComponent";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { ROUTES } from "../constants/routes";
import apiConfig from "../config/apiConfig";
import TextFieldComponent from "../components/TextFieldComponent";
import SnackbarAlert from "../components/SnackbarAlert";
import login_page_image from "../assets/images/login_page_image.svg";
import logo from "../assets/images/logo.svg";

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

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

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
          message: data.message || STRINGS.LOGIN_SUCCESS,
        });

        localStorage.setItem("token", data.token);
        const decoded = jwtDecode(data.token);
        const role = decoded.role || "user";

        setTimeout(() => {
          setSnack((prev) => ({ ...prev, open: false }));

          if (role === "super_admin") {
            navigate(ROUTES.SUPER_ADMIN.DASHBOARD);
          }
          if (role === "admin") {
            navigate(ROUTES.ADMIN.DASHBOARD);
          }
          if (role === "branch") {
            navigate(ROUTES.BRANCH.DASHBOARD);
          }
        }, 300);
      } else {
        setSnack({
          open: true,
          severity: "error",
          message: data.error,
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: STRINGS.SOMETHING_WENT_WRONG,
      });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "85vh", display: "block", alignItems: "center" }}>
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        spacing={12}
        sx={{
          mb: { xs: -10, sm: 0 },
          px: { xs: 2, sm: 8 },
          minHeight: "90vh",
          ml: { xs: -4 },
        }}
      >
        <SnackbarAlert
          open={snack.open}
          onClose={handleClose}
          severity={snack.severity}
          message={snack.message}
        />

        {/* Left Side - Image */}
        {!isMobile && (
          <Grid item md={6}>
            <Box
              sx={{
                mt: 10,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={login_page_image}
                alt="Login Illustration"
                width={340}
                style={{ maxWidth: "100%" }}
              />
            </Box>
          </Grid>
        )}

        {/* Right Side - Login Form */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              ml: 5,
              mt: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {isMobile ? (
              <img 
                src={logo} 
                alt="Logo" 
                style={{ 
                  width: "100px", 
                  height: "auto", 
                  marginBottom: "8px",
                  objectFit: "contain" 
                }} 
              />
            ) : (
              <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>
                <LockOutlinedIcon />
              </Avatar>
            )}
            <Typography variant="h5">Sign in</Typography>

            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ mt: 2, width: "100%", maxWidth: { xs: 290, ms: 360 } }}
            >
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

              <ButtonComponent
                type="submit"
                disabled={loading}
                variant="contained"
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? "Logging in..." : "SIGN IN"}
              </ButtonComponent>

              <Grid container sx={{ mt: 1 }}>
                <Grid item>
                  <Link
                    href="#"
                    variant="body2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(ROUTES.FORGOT_PASSWORD);
                    }}
                    sx={{ textDecoration: "none" }}
                  >
                    Forgot password?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Grid sx={{ mt: { xs: 10, md: -2 } }}>
        <FooterComponent />
      </Grid>
    </Box>
  );
};

export default Login;
