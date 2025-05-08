import React from "react";
import { Button, CircularProgress } from "@mui/material";

const ButtonComponent = ({
    children,
    variant = "contained",
    color = "primary",
    disabled = false,
    loading = false,
    startIcon = null,
    endIcon = null,
    sx = {},
    onClick = () => { },
    ...props
}) => {
    return (
        <Button
            variant={variant}
            color={color}
            disabled={disabled || loading}
            startIcon={startIcon}
            endIcon={endIcon}
            onClick={onClick}
            sx={{ minWidth: 120, ...sx }}
            {...props}
        >
            {loading ? <CircularProgress size={20} color="inherit" /> : children}
        </Button>
    );
};

export default ButtonComponent;
