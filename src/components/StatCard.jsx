import React from "react";
import {
  Card,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";

const StatCard = ({
  title,
  value,
  subtitle,
  color = "primary",
  icon,
  loading = false,
  sx = {},
  ...rest
}) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only("xs"));
  const paletteColor = [
    "primary",
    "secondary",
    "success",
    "warning",
    "info",
    "error",
  ].includes(color)
    ? color
    : "primary";

  return (
    <Card
      elevation={3}
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(31,41,55,0.07)",
        display: "flex",
        flexDirection: isXs ? "row" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        height: { xs: 100, sm: 120, md: 140 },
        width: {
          xs: "100%",
          sm: "75%",
          md: "60%",
          lg: "50%",
          xl: "40%",
        },
        minWidth: { xs: 100, sm: 245, md: 240 },
        maxWidth: { xs: 135, sm: 240, md: 240 },
        px: 2,
        py: 1,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "scale(1.03)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        },
        ...sx,
      }}
      {...rest}
    >
      {icon && (
        <Box
          sx={{
            bgcolor: theme.palette[paletteColor].light,
            color: theme.palette[paletteColor].main,
            width: isXs ? 40 : 50,
            height: isXs ? 40 : 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontSize: isXs ? 20 : 24,
            mr: isXs ? 1.5 : 2,
            ml: isXs ? 0 : 2,
          }}
        >
          {icon}
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              width: "100%",
            }}
          >
            <CircularProgress size={20} color={paletteColor} />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexDirection: isXs ? "row" : "column",
                alignItems: isXs ? "center" : "flex-start",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: 12, sm: 14 },
                  fontWeight: { xs: 500, sm: 600 },
                  color: theme.palette[paletteColor].main,
                  textAlign: isXs ? "left" : "inherit",
                  mr: isXs ? 1 : 0,
                }}
              >
                {title}
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 0.2,
                fontSize: 20,
                lineHeight: 1.1,
                textAlign: isXs ? "center" : "left",
              }}
            >
              {value}
            </Typography>
          </>
        )}

        {!isXs && subtitle && !loading && (
          <Typography
            variant="caption"
            color="text.secondary"
            fontSize={12}
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default StatCard;
