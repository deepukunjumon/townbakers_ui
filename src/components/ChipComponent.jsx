import React from "react";
import { Chip } from "@mui/material";

const ChipComponent = ({
  variant = "filled",
  label,
  color = "primary",
  size = "small",
  sx = {},
  ...props
}) => {
  return (
    <Chip
      label={label}
      variant={variant}
      color={color}
      size={size}
      sx={{
        fontSize: 13,
        color: "white",
        ...sx,
      }}
      {...props}
    />
  );
};

export default ChipComponent;
