import React from "react";
import { Outlet } from "react-router-dom";
import { getRoleFromToken } from "../utils/auth";
import AdminLayout from "../layouts/AdminLayout";
import BranchLayout from "../layouts/BranchLayout";
import Unauthorized from "../pages/Unauthorized";

const RoleBasedLayout = () => {
    const role = getRoleFromToken();

    if (role === "admin") return <AdminLayout><Outlet /></AdminLayout>;
    if (role === "branch") return <BranchLayout><Outlet /></BranchLayout>;

    return <Unauthorized />;
};

export default RoleBasedLayout;
