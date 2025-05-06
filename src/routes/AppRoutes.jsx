import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import BranchLayout from "../layouts/BranchLayout";
import AdminDashboard from "../pages/admin/Dashboard";
import BranchDashboard from "../pages/branch/Dashboard";
import AddStock from "../pages/branch/AddStock";
import CreateEmployee from "../pages/branch/CreateEmployee";
import ViewStocks from "../pages/branch/ViewStocks";
import ViewBranchStockSummary from "../pages/admin/ViewBranchStockSummary";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/unauthorized" element={<Unauthorized />} />

    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path=" stocks/summary" element={<ViewBranchStockSummary />} />
    </Route>

    <Route
      path="/branch/*"
      element={
        <ProtectedRoute allowedRoles={["branch"]}>
          <BranchLayout />
        </ProtectedRoute>
      }
    >
      <Route path="dashboard" element={<BranchDashboard />} />
      <Route path="employee/create" element={<CreateEmployee />} />
      <Route path="stock/add" element={<AddStock />} />
      <Route path="stocks/view" element={<ViewStocks />} />
    </Route>

    <Route path="*" element={<div>404 Not Found</div>} />
  </Routes>
);

export default AppRoutes;
