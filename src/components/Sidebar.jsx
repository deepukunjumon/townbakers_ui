import React from "react";
import {
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Box,
    Typography,
} from "@mui/material";

const drawerWidth = 240;

const Sidebar = ({ open, toggleDrawer, menuItems = [], isMobile }) => {
    const drawerContent = (
        <Box onClick={isMobile ? toggleDrawer : undefined} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Admin Panel
            </Typography>
            <List>
                {menuItems.map((item, index) => (
                    <ListItem button key={index} onClick={item.onClick}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Drawer
            variant={isMobile ? "temporary" : "persistent"} // ✅ Key line
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
