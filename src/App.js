// src/App.js
import { React, useEffect } from "react";
import { CssBaseline } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppRoutes />
    </BrowserRouter>
  );
}

function HomePage() {
  useEffect(() => {
    document.title = "Dashboard - My App";
  }, []);

  return <div>Welcome!</div>;
}

export default App;
