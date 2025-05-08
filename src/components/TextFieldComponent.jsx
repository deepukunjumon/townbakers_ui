import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const TextFieldComponent = ({
  label,
  type = "text",
  value,
  onChange,
  showPassword,
  setShowPassword,
  name,
  children,
  sx = {},
  ...props
}) => {
  const isPassword =
    type === "password" || label.toLowerCase().includes("password");
  const isSelect = type === "select";

  return (
    <TextField
      sx={sx}
      select={isSelect}
      name={name}
      label={label}
      type={isPassword && !showPassword ? "password" : type}
      value={value}
      onChange={onChange}
      fullWidth
      margin="normal"
      variant="outlined"
      size="small"
      InputProps={{
        endAdornment: isPassword ? (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setShowPassword?.((prev) => !prev)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      SelectProps={
        isSelect
          ? {
              MenuProps: {
                PaperProps: {
                  sx: {
                    maxHeight: 200,
                    overflowY: "auto",
                  },
                },
              },
            }
          : undefined
      }
      {...props}
    >
      {isSelect && children}
    </TextField>
  );
};

export default TextFieldComponent;
