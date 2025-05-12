import React, { useState, useEffect } from "react";
import { Box, Toolbar, useMediaQuery, useTheme } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const drawerWidth = 240;

const MainLayout = ({ children, menuItems = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const toggleDrawer = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        maxWidth: "100%",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Top AppBar */}
      <Navbar toggleDrawer={toggleDrawer} />

      {/* Sidebar */}
      <Sidebar
        open={open}
        toggleDrawer={toggleDrawer}
        menuItems={menuItems}
        isMobile={isMobile}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            sm: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          },
          ml: {
            xs: 0,
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
    </Box>
  );
};

export default MainLayout;
