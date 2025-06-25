import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, IconButton, Divider, CircularProgress } from "@mui/material";
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
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";

const STATUS_COLORS = {
  pending: "#ff9800",
  delivered: "#4caf50",
  cancelled: "#f44336",
};

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    {
      title: "Total Branches",
      loading: true,
      color: "info",
      icon: <BusinessIcon />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.BRANCH_LIST),
    },
    {
      title: "Total Employees",
      loading: true,
      color: "primary",
      icon: <PeopleIcon />,
      onClick: () => navigate(`${ROUTES.SUPER_ADMIN.EMPLOYEES_LIST}`),
    },
    {
      title: "Today's Pending Orders",
      loading: true,
      color: "warning",
      icon: <AssignmentIcon />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.ALL_ORDERS, {
        state: { status: "pending", todayOnly: true },
      }),
    },
    {
      title: "Today's Delivered Orders",
      loading: true,
      color: "success",
      icon: <AssignmentIcon />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.ALL_ORDERS, {
        state: { status: "delivered", todayOnly: true },
      }),
    },
  ]);

  // Date range and branch selection state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // first day of month
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [branchList, setBranchList] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [pieLoading, setPieLoading] = useState(false);

  const fetchStats = useCallback(() => {
    setStats((prevStats) =>
      prevStats.map((stat) => ({
        ...stat,
        loading: true,
      }))
    );
    axios
      .get(apiConfig.SUPER_ADMIN.DASHBOARD_STATS, {
        params: {
          orders: true
        },
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
              if (stat.title === "Today's Pending Orders") {
                return {
                  ...stat,
                  value: data.todays_orders.pending,
                  loading: false,
                };
              }
              if (stat.title === "Today's Delivered Orders") {
                return {
                  ...stat,
                  value: data.todays_orders.delivered,
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

  // Fetch minimal branches on mount
  useEffect(() => {
    axios
      .get(apiConfig.MINIMAL_BRANCHES, {
        headers: { Authorization: getToken() },
      })
      .then((res) => {
        if (res.data.success) {
          setBranchList(res.data.branches || []);
        }
      });
  }, []);

  // Fetch pie chart data when date range or branch changes
  useEffect(() => {
    if (!startDate || !endDate || !selectedBranch) return;
    setPieLoading(true);
    setPieData(null);
    const params = new URLSearchParams({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      branch_id: selectedBranch.id,
    }).toString();
    axios
      .get(`/api/admin/dashboard/order/stats?${params}`, {
        headers: { Authorization: getToken() },
      })
      .then((res) => {
        if (res.data.success && res.data.data && res.data.data.length > 0) {
          const branch = res.data.data[0];
          setPieData([
            { name: "Pending", value: branch.pending, color: STATUS_COLORS.pending },
            { name: "Delivered", value: branch.delivered, color: STATUS_COLORS.delivered },
            { name: "Cancelled", value: branch.cancelled, color: STATUS_COLORS.cancelled },
          ]);
        } else {
          setPieData(null);
        }
      })
      .catch(() => setPieData(null))
      .finally(() => setPieLoading(false));
  }, [startDate, endDate, selectedBranch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", mb: 2 }}
      >
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>
        <IconButton aria-label="refresh" onClick={fetchStats}>
          <RefreshIcon />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Order Status Breakdown
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <DateSelectorComponent
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                maxDate={endDate}
              />
              <DateSelectorComponent
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                minDate={startDate}
              />
              <SelectFieldComponent
                label="Branch"
                value={selectedBranch}
                onChange={(e, newValue) => setSelectedBranch(newValue)}
                options={branchList}
                valueKey="id"
                displayKey={(b) => `${b.code} - ${b.name}`}
                required
                sx={{ minWidth: 200 }}
              />
            </Box>
            {pieLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <CircularProgress />
              </Box>
            ) : pieData ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                No data available for the selected range/branch.
              </Typography>
            )}
          </Box>
        </Grid>
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
