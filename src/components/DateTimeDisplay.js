import React, { useEffect, useState } from "react";
import { Typography, Paper } from "@mui/material";

const DateTimeDisplay = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const time = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const date = now.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    return (
        <Paper
            variant="outlined"
            elevation={0}
            sx={{
                px: 1.2,
                py: 0.2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 60,
                height: 40,
                borderRadius: 1,
                background: "transparent",
            }}
        >
            <Typography
                variant="caption"
                sx={{ fontWeight: 600, lineHeight: 1.1, color: "text.primary", fontSize: "0.85rem" }}
            >
                {time}
            </Typography>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.1, fontSize: "0.7rem", letterSpacing: 0.2 }}
            >
                {date}
            </Typography>
        </Paper>
    );
};

export default DateTimeDisplay; 