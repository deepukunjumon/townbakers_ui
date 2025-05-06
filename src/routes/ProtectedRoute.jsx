import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getRoleFromToken } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = getToken();
    const role = getRoleFromToken();

    if (!token) return <Navigate to="/login" />;
    if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

    return children;
};

export default ProtectedRoute;
