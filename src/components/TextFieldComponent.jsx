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
  const isMobile = type === "mobile";
  const isPhone = type === "phone";
  const showError = submitted && required && !value;

  const handleChange = (e) => {
    const value =
      isMobile || isPhone ? e.target.value.replace(/\D/g, "") : e.target.value;
    onChange({ target: { name, value } });
  };

  return (
    <TextField
      sx={{
        ...sx,
        mt: 0,
      }}
      select={isSelect}
      name={name}
      label={label}
      type={
        isPassword && !showPassword
          ? "password"
          : isMobile || isPhone
          ? "text"
          : type
      }
      value={value}
      onChange={handleChange}
      fullWidth
      required={required}
      margin="normal"
      variant="outlined"
      size="medium"
      error={showError}
      helperText={showError ? "This field is required" : ""}
      inputProps={{
        ...(props.inputProps || {}),
        ...(isMobile && {
          inputMode: "numeric",
          maxLength: 10,
          pattern: "[0-9]*",
        }),
        ...(isPhone && {
          inputMode: "numeric",
          maxLength: 15,
          pattern: "[0-9]*",
        }),
      }}
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
