import React, { useState } from "react";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Badge,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";

const AvatarComponent = ({ onLogout, onProfile }) => {
  const theme = useTheme();
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <Box>
      <Tooltip title="Account options">
        <IconButton onClick={handleClick} size="small">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            badgeContent={
              <VerifiedIcon
                sx={{
                  color: theme.palette.success.main,
                  fontSize: 16,
                  backgroundColor: "white",
                  borderRadius: "50%",
                }}
              />
            }
          >
            <Avatar
              sx={{
                bgcolor: theme.palette.avatar.main,
                width: { xs: 32, sm: 36, md: 40 },
                height: { xs: 32, sm: 36, md: 40 },
                fontSize: { xs: 14, sm: 16, md: 18 },
              }}
            >
              {initials}
            </Avatar>
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            onProfile();
          }}
        >
          Profile
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onLogout();
          }}
        >
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AvatarComponent;
