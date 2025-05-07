import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const BranchLayout = () => {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Dashboard", onClick: () => navigate("/branch/dashboard") },
    {
      label: "Create Employee",
      onClick: () => navigate(ROUTES.BRANCH.CREATE_EMPLOYEE),
    },
    {
      label: "All Employees",
      onClick: () => navigate(ROUTES.BRANCH.LIST_EMPLOYEES),
    },
    { label: "Add Stock", onClick: () => navigate(ROUTES.BRANCH.ADD_STOCK) },
    {
      label: "View Stocks",
      onClick: () => navigate(ROUTES.BRANCH.VIEW_STOCKS),
    },
  ];

  return (
    <MainLayout menuItems={menuItems}>
      <Outlet />
    </MainLayout>
  );
};

export default BranchLayout;
