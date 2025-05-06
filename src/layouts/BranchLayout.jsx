import React from "react";
import MainLayout from "../components/MainLayout";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const BranchLayout = () => {
    const navigate = useNavigate();
    const menuItems = [
        { label: "Dashboard", onClick: () => navigate("/branch/dashboard") },
        { label: "Add Stock", onClick: () => navigate(ROUTES.BRANCH.ADD_STOCK) },
    ];

    return (
        <MainLayout menuItems={menuItems}>
            <Outlet />
        </MainLayout>
    );
};

export default BranchLayout;
