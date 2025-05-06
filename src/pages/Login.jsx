import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { Box, Typography, Link, Avatar, Button } from "@mui/material";
import { ROUTES } from "../constants/routes";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import TextFieldComponent from "../components/TextFieldComponent";
import apiConfig from "../config/apiConfig";
import illustration from "../assets/images/illustration.png";
import SnackbarAlert from "../components/SnackbarAlert";

const Login = () => {
  const navigate = useNavigate();
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

        let role = "user";
        try {
          const decoded = jwtDecode(data.token);
          role = decoded.role || "user";
        } catch {
          role = "user";
        }

        setTimeout(() => {
          setSnack((prev) => ({ ...prev, open: false }));

          if (role === "admin") {
            navigate(ROUTES.ADMIN.DASHBOARD);
          }
          if (role === "branch") {
            navigate(ROUTES.BRANCH.DASHBOARD);
          }
        });

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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f7f7f7"
    >
      <SnackbarAlert
        open={snack.open}
        onClose={handleClose}
        severity={snack.severity}
        message={snack.message}
      />
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          mr: 6,
        }}
      >
        <img
          src={illustration}
          alt="Login Illustration"
          style={{ maxWidth: 350, width: "100%", height: "auto" }}
        />
      </Box>

      <Box
        sx={{
          width: { xs: "100%", sm: 350 },
          mx: "auto",
          p: { xs: 2, sm: 3 },
          boxSizing: "border-box",
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "primary.main",
              m: 5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 36 }} />
          </Avatar>
        </Box>
        <form onSubmit={handleLogin}>
          <TextFieldComponent
            label="Username"
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
            required
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
          <Button
            type="submit"
            disabled={loading}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? "Logging In..." : "Login"}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
