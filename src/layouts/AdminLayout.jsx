import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { ROUTES } from "../constants/routes";
import {
  Dashboard,
  Domain,
  DomainAdd,
  People,
  PersonAddAltRounded,
  PeopleAltRounded,
  Badge,
  MenuBook,
  Token,
  Inventory,
  Article,
  Assignment,
  MultipleStop,
  Mail,
  AssignmentAdd
} from "@mui/icons-material";

const AdminLayout = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: <Dashboard />,
      onClick: () => navigate(ROUTES.ADMIN.DASHBOARD),
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
          onClick: () => navigate(ROUTES.ADMIN.DESIGNATIONS),
        },
      ],
    },
    {
      label: "Branches",
      icon: <Domain />,
      children: [
        {
          icon: <DomainAdd />,
          label: "Create Branch",
          onClick: () => navigate(ROUTES.ADMIN.CREATE_BRANCH),
        },
        {
          icon: <Domain />,
          label: "All Branches",
          onClick: () => navigate(ROUTES.ADMIN.BRANCH_LIST),
        },
      ],
    },
    {
      label: "Employees",
      icon: <People />,
      children: [
        {
          icon: <PersonAddAltRounded />,
          label: "Add Employee",
          onClick: () => navigate(ROUTES.ADMIN.CREATE_EMPLOYEE),
        },
        {
          icon: <PeopleAltRounded />,
          label: "Manage Employees",
          onClick: () => navigate(ROUTES.ADMIN.EMPLOYEES_LIST),
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
          onClick: () => navigate(ROUTES.ADMIN.STOCK_SUMMARY),
        },
      ],
    },
    {
      label: "Orders",
      icon: <Assignment />,
      children: [
        {
          icon: <AssignmentAdd />,
          label: "Create Order",
          onClick: () => navigate(ROUTES.ADMIN.CREATE_ORDER),
        },
        {
          icon: <Assignment />,
          label: "All Orders",
          onClick: () => navigate(ROUTES.ADMIN.ALL_ORDERS),
        },
      ],
    },
    {
      label: "Logs",
      icon: <MultipleStop />,
      children: [
        {
          label: "Email Logs",
          icon: <Mail />,
          onClick: () => navigate(ROUTES.ADMIN.EMAIL_LOGS),
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
