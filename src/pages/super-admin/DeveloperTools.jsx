import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  Divider,
  Paper,
} from "@mui/material";
import apiConfig from "../../config/apiConfig";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MailIcon from "@mui/icons-material/Mail";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TextFieldComponent from "../../components/TextFieldComponent";
import ButtonComponent from "../../components/ButtonComponent";
import { getToken } from "../../utils/auth";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";

const DeveloperTools = () => {
  const [expanded, setExpanded] = useState({
    mail: false,
    whatsapp: false,
  });

  const [mailForm, setMailForm] = useState({
    to: "",
    cc: "",
  });

  const [mailLoading, setMailLoading] = useState(false);
  const [mailResponse, setMailResponse] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleExpand = (tool) => {
    setExpanded((prev) => ({
      ...prev,
      [tool]: !prev[tool],
    }));
  };

  const handleMailChange = (e) => {
    const { name, value } = e.target;
    setMailForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestMail = async () => {
    if (!mailForm.to) {
      setSnack({
        open: true,
        message: "Please enter recipient email",
        severity: "error",
      });
      return;
    }

    setMailLoading(true);
    setMailResponse(null);
    try {
      const res = await fetch(apiConfig.MAIL_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          to: mailForm.to,
          ...(mailForm.cc && { cc: mailForm.cc }),
        }),
      });

      const data = await res.json();
      setSnack({
        open: true,
        message:
          data.message ||
          (res.ok ? "Test mail sent successfully" : "Failed to send test mail"),
        severity: res.ok ? "success" : "error",
      });

      if (res.ok) {
        setMailForm({ to: "", cc: "" });
        setMailResponse(data.message);
        setTimeout(() => {
          setMailResponse(null);
        }, 5000);
      }
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to send test mail",
        severity: "error",
      });
    } finally {
      setMailLoading(false);
    }
  };

  const tools = [
    {
      id: "mail",
      title: "Mail Test",
      icon: <MailIcon />,
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test email functionality and configurations
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextFieldComponent
              label="To Email"
              name="to"
              value={mailForm.to}
              onChange={handleMailChange}
              required
              type="email"
            />
            <TextFieldComponent
              label="CC Email (Optional)"
              name="cc"
              value={mailForm.cc}
              onChange={handleMailChange}
              type="email"
            />
            <ButtonComponent
              variant="contained"
              onClick={handleTestMail}
              disabled={mailLoading}
              sx={{ alignSelf: "flex-start" }}
              color="success"
            >
              {mailLoading ? "Sending..." : "Send Test Mail"}
            </ButtonComponent>

            {mailLoading && <Loader />}

            {mailResponse && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "success.light",
                  color: "success.contrastText",
                  mt: 2,
                }}
              >
                <Typography variant="body2">{mailResponse}</Typography>
              </Paper>
            )}
          </Box>
        </Box>
      ),
    },
    {
      id: "whatsapp",
      title: "WhatsApp Test",
      icon: <WhatsAppIcon />,
      content: (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Test WhatsApp integration and message delivery
          </Typography>
          {/* Add WhatsApp test content here */}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 4, px: 2 }}>
      <Typography variant="h6" gutterBottom>
        Developer Tools
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {tools.map((tool) => (
        <Card
          key={tool.id}
          sx={{
            mb: 2,
            "&:hover": {
              boxShadow: 3,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => handleExpand(tool.id)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {tool.icon}
                <Typography variant="subtitle1" fontWeight="medium">
                  {tool.title}
                </Typography>
              </Box>
              <IconButton
                sx={{
                  transform: expanded[tool.id]
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                  transition: "transform 0.3s",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            <Collapse in={expanded[tool.id]}>{tool.content}</Collapse>
          </CardContent>
        </Card>
      ))}

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />
    </Box>
  );
};

export default DeveloperTools;
