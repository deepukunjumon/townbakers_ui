import React from "react";
import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AvatarComponent from "./AvatarComponent";
import { useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const Navbar = ({ toggleDrawer }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate(ROUTES.LOGIN);
  };

  const handleProfile = () => {
    navigate(ROUTES.PROFILE);
  };

  const hideMenuIcon = location.pathname === ROUTES.RESET_PASSWORD;

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        width: "100%",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center">
          {!hideMenuIcon && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Box>

        <AvatarComponent onLogout={handleLogout} onProfile={handleProfile} />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
