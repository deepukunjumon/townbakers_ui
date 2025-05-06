// src/components/TextFieldComponent.js
import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const TextFieldComponent = ({
  label,
  type,
  value,
  onChange,
  showPassword,
  setShowPassword,
}) => {
  return (
    <TextField
      label={label}
      type={type}
      value={value}
      fullWidth
      onChange={onChange}
      margin="normal"
      variant="outlined"
      size="small"
      InputProps={{
        endAdornment:
          label === "Password" ? (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ) : null,
        style: { fontSize: 16 },
      }}
    />
  );
};

export default TextFieldComponent;
