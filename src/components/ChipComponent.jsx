import React from "react";
import { Chip } from "@mui/material";

const ChipComponent = ({
  label,
  color = "primary",
  size = "small",
  sx = {},
  ...props
}) => {
  return (
    <Chip
      label={label}
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
