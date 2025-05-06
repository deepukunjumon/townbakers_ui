import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
    const navigate = useNavigate();
    const menuItems = [
        { label: "Dashboard", onClick: () => navigate("/admin/dashboard") },
    ];

    return (
        <MainLayout menuItems={menuItems}>
            <Outlet />
        </MainLayout>
    );
};

export default AdminLayout;
