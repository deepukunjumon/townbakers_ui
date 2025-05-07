import React, { useState } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const drawerWidth = 240;

const MainLayout = ({ children, menuItems = [] }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [open, setOpen] = useState(!isMobile);
    const toggleDrawer = () => setOpen(!open);

    return (
        <Box sx={{ display: "flex", width: "100%", overflowX: "hidden" }}>
            <Navbar toggleDrawer={toggleDrawer} />

            <Sidebar
                open={open}
                toggleDrawer={toggleDrawer}
                menuItems={menuItems}
                isMobile={isMobile}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    ml: !isMobile && open ? `${drawerWidth}px` : 0,
                    transition: "margin-left 0.3s ease",
                    mt: { xs: 7, sm: 1 }, // adjust for AppBar height
                }}
            >
                <Toolbar sx={{ display: { xs: "none", sm: "block" } }} />
                {children}
            </Box>
        </Box>
    );
};

export default MainLayout;
