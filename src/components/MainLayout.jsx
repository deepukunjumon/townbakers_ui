import React, { useState } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import FooterComponent from "./FooterComponent";

const drawerWidth = 240;

const MainLayout = ({ children, menuItems = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Navbar */}
      <Navbar toggleDrawer={toggleDrawer} isSidebarOpen={open} />

      {/* Sidebar */}
      <Sidebar
        open={open}
        toggleDrawer={toggleDrawer}
        menuItems={menuItems}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: {
            xs: "auto",
            sm: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          },
          ml: {
            xs: 1,
            sm: open ? `${drawerWidth}px` : 0,
          },
          transition: "margin-left 0.3s ease, width 0.3s ease",
          p: { xs: 2, sm: 3 },
          mt: { xs: 7, sm: 0, md: 0 },
        }}
      >
        <Toolbar sx={{ display: { xs: "none", sm: "block" } }} />
        {children}
      </Box>

      {/* Footer */}
      <FooterComponent />
    </Box>
  );
};

export default MainLayout;
