import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Typography, IconButton } from "@mui/material";
import StatCard from "../../components/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from '@mui/icons-material/Assignment';
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import { ROUTES } from "../../constants/routes";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState([
    {
      title: "Employees",
      subtitle: "Active employees count",
      loading: true,
      color: "primary",
      icon: <PeopleIcon />,
      onClick: () => navigate(ROUTES.BRANCH.LIST_EMPLOYEES),
    },
    {
      title: "Total Upcoming Orders",
      subtitle: "Count of pending orders",
      loading: true,
      color: "warning",
      icon: <AssignmentIcon />,
    },
    {
      title: "Today's Pending Oders",
      subtitle: "Orders to be completed today",
      loading: true,
      color: "info",
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
      .get(apiConfig.BRANCH_DASHBOARD_STATS, {
        headers: {
          Authorization: getToken(),
        },
      })
      .then((res) => {
        if (res.data.success) {
          const data = res.data.data;

          setStats((prevStats) =>
            prevStats.map((stat) => {
              if (stat.title === "Employees") {
                return {
                  ...stat,
                  value: data.active_employees_count,
                  loading: false,
                };
              }
              if (stat.title === "Total Upcoming Orders") {
                return {
                  ...stat,
                  value: data.pending_orders_count,
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
              if (stat.title === "Today's Pending Oders") {
                return {
                  ...stat,
                  value: data.todays_pending_orders_count,
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
  }, [navigate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Box sx={{ mt: { xs: -3 }, p: 3, maxWidth: "100%", mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
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

export default Dashboard;