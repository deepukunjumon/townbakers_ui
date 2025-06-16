import React from "react";
import {
  Card,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery,
  alpha,
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

  const bgGradient = `linear-gradient(135deg, ${alpha(
    theme.palette[paletteColor].main,
    0.85
  )}, ${alpha(theme.palette[paletteColor].dark, 0.85)})`;

  return (
    <Card
      elevation={0}
      sx={{
        background: bgGradient,
        color: theme.palette[paletteColor].contrastText,
        borderRadius: 2,
        width: "100%",
        minWidth: { xs: 120, sm: 140, md: 160 },
        maxWidth: { xs: 160, sm: 160, md: 225 },
        height: "auto",
        p: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        boxShadow: `0px 4px 12px ${alpha(
          theme.palette[paletteColor].main,
          0.3
        )}`,
        backdropFilter: "blur(8px)",
        "&:hover": {
          transform: "translateY(-10px)",
          boxShadow: `0px 8px 20px ${alpha(
            theme.palette[paletteColor].dark,
            0.3
          )}`,
        },
        ...sx,
      }}
      {...rest}
    >
      {/* Icon */}
      {icon && (
        <Box
          sx={{
            backgroundColor: alpha(theme.palette.common.white, 0.2),
            color: theme.palette.common.white,
            width: isXs ? 32 : 36,
            height: isXs ? 32 : 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            fontSize: isXs ? 18 : 20,
            mr: 2,
            flexShrink: 0,
            backdropFilter: "blur(6px)",
            transition: "transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
            },
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
          minWidth: 0,
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
            <CircularProgress size={16} color="inherit" />
          </Box>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: isXs ? "0.625rem" : "0.75rem",
                mb: 0.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: isXs ? "1rem" : "1.2rem",
                lineHeight: 1.2,
                wordBreak: "break-word"
              }}
            >
              {value}
            </Typography>
          </>
        )}
      </Box>
    </Card>
  );
};

export default StatCard;
