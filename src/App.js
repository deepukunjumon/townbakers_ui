// src/App.js
import { React } from "react";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppRoutes />
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
}

export default App;
