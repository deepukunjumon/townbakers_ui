import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loader = ({ message = "Loading..." }) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      bgcolor: "rgba(255,255,255,0.7)",
      zIndex: 2000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <CircularProgress size={60} />
    <Typography variant="h6" sx={{ mt: 2 }}>
      {message}
    </Typography>
  </Box>
);

export default Loader;
