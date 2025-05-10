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
  required = false,
  submitted = false,
  ...props
}) => {
  const isPassword =
    type === "password" || (label && label.toLowerCase().includes("password"));
  const isSelect = type === "select";
  const showError = submitted && required && !value;

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
      required={required}
      margin="normal"
      variant="outlined"
      size="small"
      error={showError}
      helperText={showError ? "This field is required" : ""}
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
