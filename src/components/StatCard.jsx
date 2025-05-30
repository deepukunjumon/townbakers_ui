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
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));

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
      elevation={1}
      sx={{
        bgcolor: theme.palette.background.paper,
        borderRadius: 1.5,
        boxShadow: `0 1px 4px rgba(0, 0, 0, 0.08)`,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        minWidth: { xs: 120, sm: 140, md: 160 },
        maxWidth: { xs: 140, sm: 160, md: 225 },
        height: "auto",
        p: 1.5,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.12)`,
          "& .icon-box": {
            transform: "scale(1.1)",
          },
        },
        ...sx,
      }}
      {...rest}
    >
      {/* Icon */}
      {icon && (
        <Box
          className="icon-box"
          sx={{
            bgcolor: theme.palette[paletteColor].main,
            color: "#fff",
            width: isXs ? 32 : 36,
            height: isXs ? 32 : 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontSize: isXs ? 18 : 20,
            mr: 1.5,
            flexShrink: 0,
            transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {icon}
        </Box>
      )}

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          minWidth: 0, // Prevents text overflow
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <CircularProgress size={16} color={paletteColor} />
          </Box>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.secondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                fontSize: isXs ? "0.625rem" : "0.75rem",
                mb: 0.25,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: isXs ? "0.875rem" : "1rem",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                  fontSize: isXs ? "0.625rem" : "0.75rem",
                  mt: 0.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </Box>
    </Card>
  );
};

export default StatCard;
