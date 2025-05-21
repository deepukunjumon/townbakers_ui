import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ROUTES } from "../constants/routes";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DomainIcon from "@mui/icons-material/Domain";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import ArticleIcon from "@mui/icons-material/Article";
import InventoryIcon from "@mui/icons-material/Inventory";
import TokenIcon from "@mui/icons-material/Token";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Shield } from "@mui/icons-material";

const SuperAdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <DashboardIcon />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD),
    },
    {
      label: "Masters",
      icon: <TokenIcon />,
      children: [
        {
          icon: <MenuBookIcon />,
          label: "Items",
          onClick: () => navigate(ROUTES.ITEMS_LIST),
        },
      ],
    },
    {
      label: "Super Access",
      icon: <Shield />,
      children: [
        {
          icon: <PersonAddAltRoundedIcon />,
          label: "Create User",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.CREATE_USER),
        },
      ],
    },
    {
      label: "Manage",
      icon: <DomainIcon />,
      children: [
        {
          icon: <DomainIcon />,
          label: "Branches",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.BRANCH_LIST),
        },
        {
          icon: <PeopleAltRoundedIcon />,
          label: "Employees",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.EMPLOYEES_LIST),
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
          onClick: () => navigate(ROUTES.SUPER_ADMIN.STOCK_SUMMARY),
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
      title="Super-Admin Dashboard"
    >
      <Outlet />
    </MainLayout>
  );
};

export default SuperAdminLayout;
