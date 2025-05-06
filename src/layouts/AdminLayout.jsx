import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const menuItems = [
    { label: "Dashboard", onClick: () => navigate("/admin/dashboard") },
    {
      label: "Stocks Summary",
      onClick: () => navigate("/admin/stocks/summary"),
    },
  ];

  return (
    <MainLayout menuItems={menuItems}>
      <Outlet />
    </MainLayout>
  );
};

export default AdminLayout;
