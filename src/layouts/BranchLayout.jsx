import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import {
  Assignment,
  AssignmentAdd,
  Dashboard,
  FormatListBulletedAdd,
  People,
  PersonAddAltRounded,
  PeopleAltRounded,
  MenuBook,
  Token,
  Inventory,
  Wysiwyg
} from "@mui/icons-material";

const BranchLayout = () => {
  const navigate = useNavigate();
  const menuItems = [
    {
      icon: <Dashboard />,
      label: "Dashboard",
      onClick: () => navigate(ROUTES.BRANCH.DASHBOARD),
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
      ],
    },
    {
      label: "Employees",
      icon: <People />,
      children: [
        {
          icon: <PersonAddAltRounded />,
          label: "Add Employee",
          onClick: () => navigate(ROUTES.BRANCH.CREATE_EMPLOYEE),
        },
        {
          icon: <PeopleAltRounded />,
          label: "Branch Employees",
          onClick: () => navigate(ROUTES.BRANCH.LIST_EMPLOYEES),
        },
      ],
    },
    {
      label: "Stocks",
      icon: <Inventory />,
      children: [
        {
          icon: <FormatListBulletedAdd />,
          label: "Add Stock",
          onClick: () => navigate(ROUTES.BRANCH.ADD_STOCK),
        },
        {
          icon: <Wysiwyg />,
          label: "View Stocks",
          onClick: () => navigate(ROUTES.BRANCH.VIEW_STOCKS),
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
          onClick: () => navigate(ROUTES.BRANCH.CREATE_ORDER),
        },
        {
          icon: <Assignment />,
          label: "View Orders",
          onClick: () => navigate(ROUTES.BRANCH.LIST_ORDERS),
        },
      ],
    },
  ];

  return (
    <MainLayout menuItems={menuItems}>
      <Outlet />
    </MainLayout>
  );
};

export default BranchLayout;
