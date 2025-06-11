import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, IconButton } from "@mui/material";
import StatCard from "../../components/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      title: "Total Branches",
      subtitle: "Active branches count",
      loading: true,
      color: "info",
      icon: <BusinessIcon />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.BRANCH_LIST),
    },
    {
      title: "Total Employees",
      subtitle: "Active employees count",
      loading: true,
      color: "primary",
      icon: <PeopleIcon />,
      onClick: () => navigate(`${ROUTES.SUPER_ADMIN.EMPLOYEES_LIST}`),
    },
    {
      title: "Upcoming Orders",
      subtitle: "Total upcoming orders count",
      loading: true,
      color: "warning",
      icon: <AssignmentIcon />,
    },
  ]);

  const fetchStats = useCallback(() => {
    setStats((prevStats) =>
      prevStats.map((stat) => ({
        ...stat,
        loading: true,
      }))
    );
    axios
      .get(apiConfig.SUPER_ADMIN.DASHBOARD_STATS, {
        headers: {
          Authorization: getToken(),
        },
      })
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;

          setStats((prevStats) =>
            prevStats.map((stat) => {
              if (stat.title === "Total Employees") {
                return {
                  ...stat,
                  value: data.active_employees_count,
                  loading: false,
                };
              }
              if (stat.title === "Total Branches") {
                return {
                  ...stat,
                  value: data.active_branches_count,
                  loading: false,
                };
              }
              if (stat.title === "Upcoming Orders") {
                return {
                  ...stat,
                  value: data.upcoming_orders_count,
                  loading: false,
                };
              }
              return stat;
            })
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats:", err);
      });
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box
        sx={{ mt: { xs: -3 }, display: "flex", alignItems: "center", mb: 2 }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <IconButton aria-label="refresh" onClick={fetchStats}>
          <RefreshIcon />
        </IconButton>
      </Box>
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

export default SuperAdminDashboard;
