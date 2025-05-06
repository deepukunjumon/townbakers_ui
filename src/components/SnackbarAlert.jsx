import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackbarAlert = ({
    open,
    onClose,
    severity = "success",
    message,
    autoHideDuration = 6000,
    anchorOrigin = { vertical: "top", horizontal: "right" },
}) => (
    <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        sx={{
            '& .MuiPaper-root': {
                width: { xs: '90vw', sm: 320, md: 400 },
                maxWidth: '100vw',
                boxSizing: 'border-box',
            },
        }}
    >
        <Alert
            onClose={onClose}
            severity={severity}
            sx={{
                width: '100%',
                p: { xs: 1, sm: 2 },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                boxSizing: 'border-box',
            }}
        >
            {message}
        </Alert>
    </Snackbar>
);

export default SnackbarAlert; 