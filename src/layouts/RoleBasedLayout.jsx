import React from "react";
import { Outlet } from "react-router-dom";
import { getRoleFromToken } from "../utils/auth";
import AdminLayout from "../layouts/AdminLayout";
import SuperAdminLayout from "../layouts/SuperAdminlayout";
import BranchLayout from "../layouts/BranchLayout";
import Unauthorized from "../pages/Unauthorized";

const RoleBasedLayout = () => {
    const role = getRoleFromToken();

    if (role === "super_admin") return <SuperAdminLayout><Outlet /></SuperAdminLayout>;
    if (role === "admin") return <AdminLayout><Outlet /></AdminLayout>;
    if (role === "branch") return <BranchLayout><Outlet /></BranchLayout>;

    return <Unauthorized />;
};

export default RoleBasedLayout;
