import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import StatCard from "../../components/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WorkIcon from "@mui/icons-material/Work";
import BusinessIcon from "@mui/icons-material/Business";

const Dashboard = () => {
    const dummyStats = [
        {
            title: "Total Employees",
            value: 128,
            subtitle: "Active in all branches",
            color: "primary",
            icon: <PeopleIcon />,
        },
        {
            title: "Total Stock Items",
            value: 542,
            subtitle: "Across warehouses",
            color: "success",
            icon: <InventoryIcon />,
        },
        {
            title: "Open Positions",
            value: 6,
            subtitle: "In recruitment pipeline",
            color: "error",
            icon: <WorkIcon />,
        },
        {
            title: "Total Branches",
            value: 8,
            subtitle: "Latest branch added",
            color: "info",
            icon: <BusinessIcon />,
        },
    ];

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            <Typography variant="h5" mb={3}>
                Dashboard Overview
            </Typography>

            {/* Wrap cards inside a Grid container */}
            <Grid container spacing={2}>
                {dummyStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                        <StatCard {...stat} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;
