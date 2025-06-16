import React from "react";
import { Box, Typography } from "@mui/material";
import FooterComponent from "../components/FooterComponent";

const Unauthorized = () => {
    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                }}
            >
                <Typography variant="h1" color="primary" gutterBottom>
                    401
                </Typography>
                <Typography variant="h5" gutterBottom>
                    Unauthorized !
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    You are not allowed to view this page !.
                </Typography>
            </Box>
            <FooterComponent />
        </Box>
    );
};


export default Unauthorized;
