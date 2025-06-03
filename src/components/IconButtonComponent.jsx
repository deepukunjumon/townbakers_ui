import React from 'react';
import { IconButton, CircularProgress, Tooltip } from '@mui/material';

const IconButtonComponent = ({
  icon: Icon,
  onClick,
  color = "primary",
  size = "small",
  disabled = false,
  loading = false,
  title,
  sx = {},
}) => {
  return (
    <Tooltip title={title || ""}>
      <span>
        <IconButton
          size={size}
          onClick={onClick}
          color={color}
          disabled={disabled || loading}
          sx={{
            padding: 0.5,
            "& .MuiSvgIcon-root": { fontSize: "1.3rem" },
            ...sx
          }}
        >
          {loading ? <CircularProgress size={20} /> : <Icon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default IconButtonComponent; 