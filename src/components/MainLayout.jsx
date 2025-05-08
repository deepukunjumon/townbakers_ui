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
          p: { xs: 2, sm: 2 },
          ml: {
            xs: 0,
            sm: open ? `${drawerWidth}px` : "50px",
            md: open ? `${drawerWidth}px` : "50px",
            lg: open ? `${drawerWidth - 100}px` : "-400px",
          },
          transition: "margin-left 0.3s ease",
          mt: { xs: 7, sm: 1 },
          width: "100%",
        }}
      >
        <Toolbar sx={{ display: { xs: "none", sm: "block" } }} />
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;
