import React from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "../constants/routes";

import Login from "../pages/Login";
import ResetPassword from "../pages/ResetPassword";
import Unauthorized from "../pages/Unauthorized";

import ProtectedRoute from "./ProtectedRoute";

import ViewProfile from "../pages/ViewProfile";

import AdminLayout from "../layouts/AdminLayout";
import BranchLayout from "../layouts/BranchLayout";

import SuperAdminDashboard from "../pages/super-admin/Dashboard";

import AdminDashboard from "../pages/admin/Dashboard";
import AllEmployees from "../pages/admin/AllEmployees";
import CreateBranch from "../pages/admin/CreateBranch";
import ViewBranches from "../pages/admin/ViewBranches";

import CreateEmployeeByAdmin from "../pages/admin/CreateEmployee";
import ViewBranchStockSummary from "../pages/admin/ViewBranchStockSummary";

import BranchDashboard from "../pages/branch/Dashboard";
import AddStock from "../pages/branch/AddStock";
import CreateEmployee from "../pages/branch/CreateEmployee";
import ViewStocks from "../pages/branch/ViewStocks";
import BranchEmployees from "../pages/branch/BranchEmployees";
import CreateOrder from "../pages/branch/CreateOrder";
import ListOrders from "../pages/branch/ListOrders";
import RoleBasedLayout from "../layouts/RoleBasedLayout";

import NotFound from "../pages/NotFound";
import ItemsList from "../pages/common/masters/ItemsList";
import Designations from "../pages/common/masters/Designations";
import SuperAdminLayout from "../layouts/SuperAdminlayout";
import CreateUser from "../pages/super-admin/CreateUser";
import DeveloperTools from "../pages/super-admin/DeveloperTools";
import AdminCreateOrder from "../pages/admin/AdminCreateOrder";
import OrdersList from "../pages/admin/OrdersList";
import AuditLogs from "../pages/super-admin/AuditLogs";
import Users from "../pages/super-admin/Users";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path={ROUTES.ROOT} element={<Login />} />
    <Route path={ROUTES.LOGIN} element={<Login />} />
    <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

    <Route
      element={
        <ProtectedRoute allowedRoles={["admin", "branch", "super_admin"]} />
      }
    >
      <Route path={ROUTES.PROFILE} element={<RoleBasedLayout />}>
        <Route index element={<ViewProfile />} />
      </Route>
      <Route path={ROUTES.RESET_PASSWORD} element={<RoleBasedLayout />}>
        <Route index element={<ResetPassword />} />
      </Route>
      <Route path={ROUTES.ITEMS_LIST} element={<RoleBasedLayout />}>
        <Route index element={<ItemsList />} />
      </Route>
    </Route>

    {/* Super Admin Protected */}
    <Route
      path={ROUTES.SUPER_ADMIN.ROOT}
      element={
        <ProtectedRoute allowedRoles={["super_admin"]}>
          <SuperAdminLayout />
        </ProtectedRoute>
      }
    >
      <Route path={ROUTES.SUPER_ADMIN.DASHBOARD} element={<SuperAdminDashboard />} />
      <Route path={ROUTES.SUPER_ADMIN.CREATE_USER} element={<CreateUser />} />
      <Route path={ROUTES.SUPER_ADMIN.CREATE_USER} element={<CreateUser />} />
      <Route path={ROUTES.SUPER_ADMIN.USERS_LIST} element={<Users />} />
      <Route path={ROUTES.SUPER_ADMIN.CREATE_BRANCH} element={<CreateBranch />} />
      <Route path={ROUTES.SUPER_ADMIN.BRANCH_LIST} element={<ViewBranches />} />
      <Route path={ROUTES.SUPER_ADMIN.CREATE_EMPLOYEE} element={<CreateEmployeeByAdmin />} />
      <Route path={ROUTES.SUPER_ADMIN.EMPLOYEES_LIST} element={<AllEmployees />} />
      <Route path={ROUTES.SUPER_ADMIN.STOCK_SUMMARY} element={<ViewBranchStockSummary />} />
      <Route path={ROUTES.SUPER_ADMIN.DESIGNATIONS} element={<Designations />} />
      <Route path={ROUTES.SUPER_ADMIN.CREATE_ORDER} element={<AdminCreateOrder />} />
      <Route path={ROUTES.SUPER_ADMIN.ALL_ORDERS} element={<OrdersList />} />
      <Route path={ROUTES.SUPER_ADMIN.DEVELOPER_TOOLS} element={<DeveloperTools />} />
      <Route path={ROUTES.SUPER_ADMIN.AUDIT_LOGS} element={<AuditLogs />} />
    </Route>

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
      <Route path={ROUTES.ADMIN.EMPLOYEES_LIST} element={<AllEmployees />} />
      <Route path={ROUTES.ADMIN.CREATE_BRANCH} element={<CreateBranch />} />
      <Route path={ROUTES.ADMIN.BRANCH_LIST} element={<ViewBranches />} />
      <Route path={ROUTES.ADMIN.CREATE_EMPLOYEE} element={<CreateEmployeeByAdmin />} />
      <Route path={ROUTES.ADMIN.STOCK_SUMMARY} element={<ViewBranchStockSummary />} />
      <Route path={ROUTES.ADMIN.DESIGNATIONS} element={<Designations />} />
      <Route path={ROUTES.ADMIN.CREATE_ORDER} element={<AdminCreateOrder />} />
      <Route path={ROUTES.ADMIN.ALL_ORDERS} element={<OrdersList />} />
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
      <Route path={ROUTES.BRANCH.LIST_EMPLOYEES} element={<BranchEmployees />} />
      <Route path={ROUTES.BRANCH.ADD_STOCK} element={<AddStock />} />
      <Route path={ROUTES.BRANCH.VIEW_STOCKS} element={<ViewStocks />} />
      <Route path={ROUTES.BRANCH.CREATE_ORDER} element={<CreateOrder />} />
      <Route path={ROUTES.BRANCH.LIST_ORDERS} element={<ListOrders />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
