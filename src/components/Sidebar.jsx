import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Divider,
  Collapse,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import company_logo from "../assets/images/logo.png";

const drawerWidth = 260;

const Sidebar = ({ open, toggleDrawer, menuItems = [], isMobile }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});

  const handleToggleSubmenu = (label) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const drawerContent = (
    <Box sx={{ textAlign: "center" }}>
      {/* Close Arrow */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
        <IconButton onClick={toggleDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      {/* Company Logo */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: -6,
          mb: 2,
        }}
      >
        <img
          src={company_logo}
          alt="Company Logo"
          style={{
            maxWidth: "100%",
            maxHeight: 60,
            marginLeft: -50,
            marginTop: -20,
          }}
        />
      </Box>
      <Divider />

      <List>
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <ListItem
              button
              onClick={() => {
                if (item.children) {
                  handleToggleSubmenu(item.label);
                } else {
                  item.onClick();
                  toggleDrawer();
                }
              }}
              sx={{ cursor: "pointer" }}
            >
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <ListItemText primary={item.label} />
              {item.children &&
                (openSubmenus[item.label] ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {item.children && (
              <Collapse
                in={openSubmenus[item.label]}
                timeout="auto"
                unmountOnExit
              >
                <List component="div" disablePadding>
                  {item.children.map((child, childIndex) => (
                    <React.Fragment key={childIndex}>
                      <ListItem
                        button
                        onClick={() => {
                          if (child.children) {
                            handleToggleSubmenu(child.label);
                          } else {
                            child.onClick();
                            toggleDrawer();
                          }
                        }}
                        sx={{ pl: 6, cursor: "pointer" }}
                      >
                        {child.icon && (
                          <ListItemIcon>{child.icon}</ListItemIcon>
                        )}
                        <ListItemText primary={child.label} />
                        {child.children &&
                          (openSubmenus[child.label] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          ))}
                      </ListItem>

                      {child.children && (
                        <Collapse
                          in={openSubmenus[child.label]}
                          timeout="auto"
                          unmountOnExit
                        >
                          <List component="div" disablePadding>
                            {child.children.map(
                              (grandChild, grandChildIndex) => (
                                <ListItem
                                  button
                                  key={grandChildIndex}
                                  onClick={() => {
                                    grandChild.onClick();
                                    toggleDrawer();
                                  }}
                                  sx={{ pl: 9, cursor: "pointer" }}
                                >
                                  {grandChild.icon && (
                                    <ListItemIcon>
                                      {grandChild.icon}
                                    </ListItemIcon>
                                  )}
                                  <ListItemText primary={grandChild.label} />
                                </ListItem>
                              )
                            )}
                          </List>
                        </Collapse>
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={toggleDrawer}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 2,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
