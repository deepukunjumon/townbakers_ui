// src/components/AlertComponent.js
import React from "react";
import { Alert } from "@mui/material";

const AlertComponent = ({ message, severity }) => {
  return (
    message && (
      <Alert severity={severity} sx={{ mb: 2 }}>
        {message}
      </Alert>
    )
  );
};

export default AlertComponent;
