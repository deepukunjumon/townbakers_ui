import React, { useState } from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Box,
    Typography,
    Collapse,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

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
            <Typography variant="h6" sx={{ my: 2 }}>
                Admin Panel
            </Typography>
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
                                    if (isMobile) toggleDrawer();
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
                            <Collapse in={openSubmenus[item.label]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.children.map((child, childIndex) => (
                                        <ListItem
                                            button
                                            key={childIndex}
                                            onClick={() => {
                                                child.onClick();
                                                if (isMobile) toggleDrawer();
                                            }}
                                            sx={{ pl: 6, cursor: "pointer" }}
                                        >
                                            {child.icon && <ListItemIcon>{child.icon}</ListItemIcon>}
                                            <ListItemText primary={child.label} />
                                        </ListItem>
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
            variant={isMobile ? "temporary" : "persistent"}
            open={open}
            onClose={toggleDrawer}
            sx={{
                display: { xs: "block", md: "block" },
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
