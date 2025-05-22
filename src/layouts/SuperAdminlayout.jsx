import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ROUTES } from "../constants/routes";
import {
  Dashboard,
  Domain,
  PersonAddAltRounded,
  PeopleAltRounded,
  Security,
  Badge,
  MenuBook,
  Token,
  Inventory,
  Article
} from "@mui/icons-material";

const SuperAdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      onClick: () => navigate(ROUTES.SUPER_ADMIN.DASHBOARD),
    },
    {
      label: "Masters",
      icon: <Token />,
      children: [
        {
          icon: <MenuBook />,
          label: "Items",
          onClick: () => navigate(ROUTES.ITEMS_LIST),
        },
        {
          icon: <Badge />,
          label: "Designations",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.DESIGNATIONS),
        },
      ],
    },
    {
      label: "Super Access",
      icon: <Security />,
      children: [
        {
          icon: <PersonAddAltRounded />,
          label: "Create User",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.CREATE_USER),
        },
      ],
    },
    {
      label: "Manage",
      icon: <Domain />,
      children: [
        {
          icon: <Domain />,
          label: "Branches",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.BRANCH_LIST),
        },
        {
          icon: <PeopleAltRounded />,
          label: "Employees",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.EMPLOYEES_LIST),
        },
      ],
    },
    {
      label: "Stocks",
      icon: <Inventory />,
      children: [
        {
          icon: <Article />,
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
