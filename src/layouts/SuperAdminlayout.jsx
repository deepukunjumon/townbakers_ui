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
  Article,
  LogoDev,
  Assignment,
  MultipleStop,
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
      icon: <PersonAddAltRounded />,
      label: "Create User",
      onClick: () => navigate(ROUTES.SUPER_ADMIN.CREATE_USER),
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
    {
      label: "Orders",
      icon: <Assignment />,
      children: [
        {
          icon: <Assignment />,
          label: "Create Order",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.CREATE_ORDER),
        },
        {
          icon: <Assignment />,
          label: "All Orders",
          onClick: () => navigate(ROUTES.SUPER_ADMIN.ALL_ORDERS),
        },
      ],
    },
    {
      label: "Super Access",
      icon: <Security />,
      children: [
        {
          label: "Developer Tools",
          icon: <LogoDev />,
          onClick: () => navigate(ROUTES.SUPER_ADMIN.DEVELOPER_TOOLS),
        },
        {
          label: "Logs",
          icon: <MultipleStop />,
          children: [
            {
              label: "Audit Logs",
              icon: <MultipleStop />,
              onClick: () => navigate(ROUTES.SUPER_ADMIN.AUDIT_LOGS),
            },
          ],
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
