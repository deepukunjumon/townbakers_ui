import React, { useContext } from "react";
import { Box, Typography } from "@mui/material";
import { AppInfoContext } from "../context/AppInfoContext";

const FooterComponent = () => {
  const { version, copyright } = useContext(AppInfoContext);

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
        Version: {version}
      </Typography>
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
      >
        {copyright}
      </Typography>
    </Box>
  );
};

export default FooterComponent;