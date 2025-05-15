import React, { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileUploadIcon from '@mui/icons-material/FileUpload';

const ImportMenuComponent = ({ onImportClick }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleImport = () => {
        onImportClick();
        handleMenuClose();
    };

    return (
        <>
            <IconButton onClick={handleMenuOpen}>
                <MoreVertIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleImport}>
                    <ListItemIcon>
                        <FileUploadIcon sx={{ color: "green" }} />
                    </ListItemIcon>
                    <ListItemText primary="Import" />
                </MenuItem>
            </Menu>
        </>
    );
};

export default ImportMenuComponent;