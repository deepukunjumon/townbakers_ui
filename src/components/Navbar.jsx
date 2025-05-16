import React, { useState } from "react";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AvatarComponent from "./AvatarComponent";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const Navbar = ({ toggleDrawer }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate(ROUTES.LOGIN);
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: "100%",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left: Menu Icon and Logo */}
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Right: Avatar with dropdown */}
        <AvatarComponent onLogout={handleLogout} onProfile={handleProfile} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
