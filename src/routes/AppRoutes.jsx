import React from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "../constants/routes";

import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";

import AdminLayout from "../layouts/AdminLayout";
import BranchLayout from "../layouts/BranchLayout";

import AdminDashboard from "../pages/admin/Dashboard";
import ViewBranchStockSummary from "../pages/admin/ViewBranchStockSummary";

import BranchDashboard from "../pages/branch/Dashboard";
import AddStock from "../pages/branch/AddStock";
import CreateEmployee from "../pages/branch/CreateEmployee";
import ViewStocks from "../pages/branch/ViewStocks";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path={ROUTES.ROOT} element={<Login />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

    {/* Admin Protected */}
    <Route
      path={ROUTES.ADMIN.ROOT}
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
      <Route path={ROUTES.ADMIN.STOCK_SUMMARY} element={<ViewBranchStockSummary />} />
    </Route>

    {/* Branch Protected */}
    <Route
      path={ROUTES.BRANCH.ROOT}
      element={
        <ProtectedRoute allowedRoles={["branch"]}>
          <BranchLayout />
        </ProtectedRoute>
      }
    >
      <Route path={ROUTES.BRANCH.DASHBOARD} element={<BranchDashboard />} />
      <Route path={ROUTES.BRANCH.CREATE_EMPLOYEE} element={<CreateEmployee />} />
      <Route path={ROUTES.BRANCH.ADD_STOCK} element={<AddStock />} />
      <Route path={ROUTES.BRANCH.VIEW_STOCKS} element={<ViewStocks />} />
    </Route>

    <Route path="*" element={<div>404 Not Found</div>} />
  </Routes>
);

export default AppRoutes;
