import React from "react";
import { Modal, Box, Typography, Divider, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalComponent = ({
  open,
  onClose,
  title,
  content,
  hideCloseIcon = false,
}) => {
  return (
    <Modal open={open} onClose={hideCloseIcon ? () => { } : onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          width: { xs: "90%", sm: 600 },
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {!hideCloseIcon && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
            size="medium"
          >
            <CloseIcon />
          </IconButton>
        )}
        <Typography variant="h6" gutterBottom sx={{ pr: 4 }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
          {content}
        </Box>
      </Box>
    </Modal>
  );
};

export default ModalComponent;
