import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import StatCard from "../../components/StatCard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";

const Dashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Total Employees",
      subtitle: "Active employees count",
      loading: true,
      color: "primary",
      icon: <PeopleIcon />,
    },
    {
      title: "Total Branches",
      subtitle: "Active branches count",
      loading: true,
      color: "info",
      icon: <BusinessIcon />,
    },
  ]);

  useEffect(() => {
    axios
      .get(apiConfig.ADMIN_DASHBOARD_STATS, {
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
              return stat;
            })
          );
        }
      })
      .catch((err) => {
        console.error("Failed to load dashboard stats:", err);
      });
  }, []);

  return (
    <Box sx={{
      p: 3,
      maxWidth: "100%",
      mx: "auto"
    }}>

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
