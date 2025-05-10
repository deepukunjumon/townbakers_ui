import { createTheme } from "@mui/material/styles";

const baseTheme = createTheme({
  palette: {
    primary: {
      main: "#00c3a2",
    },
    secondary: {
      main: "#1a365d",
    },
    error: {
      main: "#f44336",
    },
    success: {
      main: "#4caf50",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif",
    fontSize: 17,
    h1: { fontWeight: 700, fontSize: "2.8rem", letterSpacing: "-0.01562em" },
    h2: { fontWeight: 700, fontSize: "2.2rem", letterSpacing: "-0.00833em" },
    h3: { fontWeight: 700, fontSize: "1.9rem" },
    h4: { fontWeight: 700, fontSize: "1.6rem" },
    h5: { fontWeight: 700, fontSize: "1.35rem" },
    h6: { fontWeight: 700, fontSize: "1.15rem" },
    body1: { fontWeight: 400, fontSize: "1rem" },
    body2: { fontWeight: 400, fontSize: "0.97rem" },
  },
});

const theme = createTheme({
  ...baseTheme,
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.primary.main,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: baseTheme.palette.background.paper,
          borderRight: "1px solid #e0e0e0",
        },
      },
    },
  },
});

export default theme;
