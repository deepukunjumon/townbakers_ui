import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Container,
    Paper,
    CircularProgress,
    Grid,
    Avatar,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiConfig from "../config/apiConfig";
import SnackbarAlert from "../components/SnackbarAlert";
import { STRINGS } from "../constants/strings";
import { ROUTES } from "../constants/routes";
import login_page_image from "../assets/images/login_page_image.svg";
import LockResetIcon from '@mui/icons-material/LockReset';
import FooterComponent from "../components/FooterComponent";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        severity: "info",
    });
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(apiConfig.FORGOT_PASSWORD, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (data.success) {
                setSnack({
                    open: true,
                    message: "OTP sent to your email.",
                    severity: "success",
                });
                setStep(2);
            } else {
                throw new Error(data.message || "Failed to send OTP.");
            }
        } catch (error) {
            setSnack({ open: true, message: error.message, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(apiConfig.VERIFY_OTP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (data.success && data.reset_token) {
                setResetToken(data.reset_token);
                setSnack({
                    open: true,
                    message: "OTP verified successfully.",
                    severity: "success",
                });
                setStep(3);
            } else {
                throw new Error(data.message || "Invalid OTP.");
            }
        } catch (error) {
            setSnack({ open: true, message: error.message, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setSnack({
                open: true,
                message: "Passwords do not match.",
                severity: "error",
            });
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(apiConfig.RESET_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Reset-Token": resetToken,
                },
                body: JSON.stringify({
                    email,
                    password,
                    password_confirmation: confirmPassword,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSnack({
                    open: true,
                    message: "Password reset successfully. Redirecting to login...",
                    severity: "success",
                });
                setTimeout(() => navigate(ROUTES.LOGIN), 2000);
            } else {
                throw new Error(data.message || "Failed to reset password.");
            }
        } catch (error) {
            setSnack({ open: true, message: error.message, severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <form onSubmit={handleRequestOtp}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Forgot Password
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter your email address and we'll send you an OTP to reset your password.
                        </Typography>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Send OTP"}
                        </Button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyOtp}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Verify OTP
                        </Typography>
                        <TextField
                            label="OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                            inputProps={{ maxLength: 6 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Verify OTP"}
                        </Button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleResetPassword}>
                        <Typography variant="h5" sx={{ mb: 2 }}>
                            Reset Password
                        </Typography>
                        <TextField
                            label="New Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            label="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            fullWidth
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} />
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                    </form>
                );
            default:
                return null;
        }
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
                    onClose={() => setSnack({ ...snack, open: false })}
                    message={snack.message}
                    severity={snack.severity}
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
                                alt="Forgot Password Illustration"
                                width={340}
                                style={{ maxWidth: "100%" }}
                            />
                        </Box>
                    </Grid>
                )}

                {/* Right Side - Form */}
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
                        <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>
                            <LockResetIcon />
                        </Avatar>

                        <Box sx={{ mt: 2, width: "100%", maxWidth: { xs: 290, ms: 360 } }}>
                            {renderStep()}
                            <Box sx={{ mt: 2, textAlign: "center" }}>
                                <Button onClick={() => navigate(ROUTES.LOGIN)}>
                                    Back to Login
                                </Button>
                            </Box>
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

export default ForgotPassword; 