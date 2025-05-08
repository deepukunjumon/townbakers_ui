import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import StatCard from "../../components/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";

const Dashboard = ({ token }) => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        axios.get(apiConfig.DASHBOARD_STATS, {
            headers: {
                Authorization: getToken(),
            },
        })
            .then((res) => {
                if (res.data.success) {
                    const data = res.data.data;

                    const mappedStats = [
                        {
                            title: "Total Employees",
                            value: data.active_employees_count,
                            subtitle: "Active in all branches",
                            color: "primary",
                            icon: <PeopleIcon />,
                        },
                        {
                            title: "Total Branches",
                            value: data.active_branches_count,
                            subtitle: "Active branches count",
                            color: "info",
                            icon: <BusinessIcon />,
                        },
                    ];

                    setStats(mappedStats);
                }
            })
            .catch((err) => {
                console.error("Failed to load dashboard stats:", err);
            });
    }, []);
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h5" mb={3}>
                Dashboard Overview
            </Typography>

            <Grid container spacing={2}>
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;
