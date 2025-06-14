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
        px: { xs: 2, sm: 3 },
        py: { xs: 1, sm: 1.5 },
        minWidth: { xs: 100, sm: 120 },
        height: { xs: 36, sm: 40 },
        fontSize: { xs: "0.875rem", sm: "0.9375rem", md: "1rem" },
        fontWeight: 500,
        textTransform: "none",
        borderRadius: 1,
        ...sx,
      }}
      {...props}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
};

export default ButtonComponent;
