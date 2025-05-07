// AdminLayout.jsx
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ROUTES } from "../constants/routes";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";

const AdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      onClick: () => navigate(ROUTES.ADMIN.DASHBOARD),
    },
    {
      label: "Add Employee",
      icon: <InventoryIcon />,
      onClick: () => navigate(ROUTES.ADMIN.CREATE_EMPLOYEE),
    },
    {
      label: "Stocks Summary",
      icon: <InventoryIcon />,
      onClick: () => navigate(ROUTES.ADMIN.STOCK_SUMMARY),
    },
  ];

  return (
    <MainLayout
      menuItems={menuItems}
      drawerWidth={280}
      collapsedWidth={60}
      showIconsWhenCollapsed={true}
      title="Admin Dashboard"
    >
      <Outlet />
    </MainLayout>
  );
};

export default AdminLayout;
