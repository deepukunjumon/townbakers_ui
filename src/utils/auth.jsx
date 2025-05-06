import { jwtDecode } from "jwt-decode";

export const getToken = () => localStorage.getItem("token");

export const getRoleFromToken = () => {
    try {
        const token = getToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.role || null;
    } catch (error) {
        return null;
    }
};

export const getBranchIdFromToken = () => {
    try {
        const token = getToken();
        if (!token) return null;
        const decoded = jwtDecode(token);
        return decoded.branch_id || null;
    } catch {
        return null;
    }
};
