import React, { useEffect, useState } from "react";
import { Typography, CircularProgress, Divider } from "@mui/material";
import axios from "axios";
import SnackbarAlert from "../components/SnackbarAlert";
import BranchLayout from "../layouts/BranchLayout";
import apiConfig from "../config/apiConfig";
import { getToken } from "../utils/auth";

const ViewProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [snack, setSnack] = useState({
        open: false,
        severity: "error",
        message: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const token = getToken();
                const response = await axios.get(`${apiConfig.BASE_URL}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    setProfile(response.data.user_details);
                    setSnack({
                        open: true,
                        severity: "success",
                        message: "Profile fetched successfully",
                    });
                } else {
                    throw new Error("Failed to fetch profile");
                }
            } catch (error) {
                setSnack({
                    open: true,
                    severity: "error",
                    message: error.response?.data?.message || "Failed to fetch profile",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <BranchLayout hideProfileOption>
            <SnackbarAlert
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                severity={snack.severity}
                message={snack.message}
            />

            <Typography variant="h5" gutterBottom>
                Profile Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {loading ? (
                <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
            ) : profile ? (
                <div>
                    <Typography>
                        <strong>Name:</strong> {profile.name}
                    </Typography>
                    <Typography>
                        <strong>Mobile:</strong> {profile.mobile}
                    </Typography>
                    <Typography>
                        <strong>Email:</strong> {profile.email}
                    </Typography>
                    <Typography>
                        <strong>Role:</strong> {profile.is_admin ? "Admin" : "User"}
                    </Typography>
                    <Typography>
                        <strong>User Since:</strong> {profile.user_since || "N/A"}
                    </Typography>
                </div>
            ) : (
                <Typography color="error">Failed to load profile details.</Typography>
            )}
        </BranchLayout>
    );
};

export default ViewProfile;