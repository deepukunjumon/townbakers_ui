// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#009688", // Green color for the app header
    },
    secondary: {
      main: "#1a365d", // Secondary color (used for hover effects, etc.)
    },
    error: {
      main: "#f44336", // Error color for Alert
    },
    success: {
      main: "#4caf50", // Success color for Alert
    },
    background: {
      default: "#f8f9fa", // Light background color of the app
      paper: "#ffffff", // Background color for Paper elements like boxes
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif", // Changed to Segoe UI with fallbacks
    fontSize: 17, // Increased base font size (default is 14)
    h1: {
      fontWeight: 700,
      fontSize: "2.8rem",
      letterSpacing: "-0.01562em",
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.2rem",
      letterSpacing: "-0.00833em",
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.9rem",
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.6rem",
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.35rem",
    },
    h6: {
      fontWeight: 700,
      fontSize: "1.15rem",
    },
    body1: {
      fontWeight: 400, // Body text styles
      fontSize: "1rem",
    },
    body2: {
      fontWeight: 400,
      fontSize: "0.97rem",
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#009688", // Ensure app bar is green
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e0e0e0",
        },
      },
    },
  },
});

export default theme;
