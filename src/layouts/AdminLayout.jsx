import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ROUTES } from "../constants/routes";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArticleIcon from "@mui/icons-material/Article";
import InventoryIcon from "@mui/icons-material/Inventory";
import PeopleIcon from "@mui/icons-material/People";
import TokenIcon from '@mui/icons-material/Token';
import CategoryIcon from '@mui/icons-material/Category';

const AdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      onClick: () => navigate(ROUTES.ADMIN.DASHBOARD),
    },
    {
      label: "Masters",
      icon: <TokenIcon />,
      children: [
        {
          icon: <CategoryIcon />,
          label: "Items",
          onClick: () => navigate(ROUTES.ITEMS_LIST),
        },
      ],
    },
    {
      label: "Branches",
      icon: <PeopleIcon />,
      children: [
        {
          icon: <PersonAddAltRoundedIcon />,
          label: "Create Branch",
          onClick: () => navigate(ROUTES.ADMIN.CREATE_BRANCH),
        },
        {
          icon: <PeopleAltRoundedIcon />,
          label: "All Branches",
          onClick: () => navigate(ROUTES.ADMIN.BRANCH_LIST),
        },
      ],
    },
    {
      label: "Employees",
      icon: <PeopleIcon />,
      children: [
        {
          icon: <PersonAddAltRoundedIcon />,
          label: "Add Employee",
          onClick: () => navigate(ROUTES.ADMIN.CREATE_EMPLOYEE),
        },
        {
          icon: <PeopleAltRoundedIcon />,
          label: "Manage Employees",
          onClick: () => navigate(ROUTES.ADMIN.EMPLOYEES_LIST),
        },
      ],
    },
    {
      label: "Stocks",
      icon: <InventoryIcon />,
      children: [
        {
          icon: <ArticleIcon />,
          label: "Stocks Summary",
          onClick: () => navigate(ROUTES.ADMIN.STOCK_SUMMARY),
        },
        {
          label: "Stock Transfers",
          onClick: () => navigate(ROUTES.ADMIN.STOCK_TRANSFERS),
        },
      ],
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
