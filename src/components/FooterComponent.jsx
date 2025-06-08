import React from "react";
import { Box, Typography } from "@mui/material";
const packageJson = require("../../package.json");

const FooterComponent = () => {
  const APP_NAME = "TBMS";
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 2,
        px: { xs: 2, sm: 4 },
        fontSize: { xs: "0.8rem", sm: "1rem" },
      }}
    >
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
      >
        © {currentYear} {APP_NAME} v{packageJson.version}
      </Typography>
    </Box>
  );
};

export default FooterComponent;
