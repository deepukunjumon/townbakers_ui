import React, { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const drawerWidth = 240;

const MainLayout = ({ children, menuItems = [] }) => {
    const [open, setOpen] = useState(true);

    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: "flex" }}>
            <Navbar toggleDrawer={toggleDrawer} />
            <Sidebar open={open} toggleDrawer={toggleDrawer} menuItems={menuItems} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    ml: open ? `${drawerWidth}px` : 0,
                    transition: "margin-left 0.3s",
                }}
            >
                <Toolbar /> {/* For spacing below the navbar */}
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
