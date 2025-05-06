import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";

const BranchLayout = () => {
    const navigate = useNavigate();
    const menuItems = [
        { label: "Dashboard", onClick: () => navigate("/branch/dashboard") },
    ];

    return (
        <MainLayout menuItems={menuItems}>
            <Outlet />
        </MainLayout>
    );
};

export default BranchLayout;
