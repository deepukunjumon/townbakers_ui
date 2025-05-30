import React from "react";
import { Button, CircularProgress } from "@mui/material";

const ButtonComponent = ({
  children,
  variant = "outlined",
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
      sx={{
        p: 1.5,
        minWidth: "auto",
        height: "auto",
        fontSize: { xs: "0.875rem", md: "1rem" },
        color: variant === "text" ? "primary" : "white",
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
};

export default ButtonComponent;
