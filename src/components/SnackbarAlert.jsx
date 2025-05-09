import React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackbarAlert = ({
    open,
    onClose,
    severity = "success",
    message,
    autoHideDuration = 1500,
    anchorOrigin = { vertical: "top", horizontal: "right" },
}) => (
    <Snackbar
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        anchorOrigin={anchorOrigin}
        sx={{
            '& .MuiPaper-root': {
                width: "auto",
                maxWidth: "90vw",
                boxSizing: "border-box",
            },
        }}
    >

        <Alert
            onClose={onClose}
            severity={severity}
            sx={{
                width: "100%",
                p: { xs: 1, sm: 2 },
                fontSize: { xs: '0.95rem', sm: '1rem' },
                boxSizing: "border-box",
                whiteSpace: "pre-line",
            }}
        >
            {message}
        </Alert>
    </Snackbar>
);

export default SnackbarAlert;
