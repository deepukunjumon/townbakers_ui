import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const iconMap = {
  warning: <WarningAmberRoundedIcon color="warning" sx={{ fontSize: 40 }} />,
  danger: <ErrorOutlineIcon color="error" sx={{ fontSize: 40 }} />,
  info: <InfoOutlinedIcon color="info" sx={{ fontSize: 40 }} />,
  success: <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />,
};

const colorMap = {
  warning: "warning",
  danger: "error",
  info: "info",
  success: "success",
  primary: "primary",
};

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  content = "Do you want to proceed?",
  description = "",
  confirmText = "Yes",
  cancelText = "Cancel",
  loading = false,
  type = "danger", // "warning" | "danger" | "info" | "success" | "primary"
  confirmColor, // override color, e.g. "error", "primary"
  icon, // override icon
  borderRadius = 3, // default 24px
  hideCancel = false,
  hideConfirm = false,
  disableBackdropClick = false,
}) => (
  <Dialog
    open={open}
    onClose={disableBackdropClick ? undefined : onClose}
    maxWidth="xs"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: borderRadius,
      },
    }}
  >
    <Box display="flex" flexDirection="column" alignItems="center" pt={3}>
      {icon !== undefined ? icon : iconMap[type] || iconMap.warning}
    </Box>
    <DialogTitle sx={{ textAlign: "center", fontWeight: 700 }}>
      {title}
    </DialogTitle>
    <DialogContent>
      <Typography align="center" sx={{ mb: description ? 1 : 0 }}>
        {content}
      </Typography>
      {description && (
        <Typography align="center" color="text.secondary" variant="body2">
          {description}
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
      {!hideCancel && (
        <Button onClick={onClose} disabled={loading} variant="outlined">
          {cancelText}
        </Button>
      )}
      {!hideConfirm && (
        <Button
          onClick={onConfirm}
          color={confirmColor || colorMap[type] || "primary"}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 100 }}
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      )}
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
