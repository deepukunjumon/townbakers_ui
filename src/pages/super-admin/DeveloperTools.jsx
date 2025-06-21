import React, { useState, useCallback, useMemo } from "react";
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

// Custom hook for form handling
const useFormState = (initialState) => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setForm(initialState);
    setResponse(null);
  }, [initialState]);

  return {
    form,
    loading,
    response,
    setLoading,
    setResponse,
    handleChange,
    resetForm,
  };
};

const DeveloperTools = () => {
  const [expanded, setExpanded] = useState({
    mail: false,
    whatsapp: false,
  });

  const mailState = useFormState({ to: "", cc: "" });
  const whatsappState = useFormState({ phone: "", message: "" });

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleExpand = useCallback((tool) => {
    setExpanded((prev) => ({
      ...prev,
      [tool]: !prev[tool],
    }));
  }, []);

  const showSnackbar = useCallback((message, severity = "info") => {
    setSnack({
      open: true,
      message,
      severity,
    });
  }, []);

  const handleTestMail = useCallback(async () => {
    if (!mailState.form.to) {
      showSnackbar("Please enter recipient email", "error");
      return;
    }

    mailState.setLoading(true);
    mailState.setResponse(null);

    try {
      const res = await fetch(apiConfig.SUPER_ADMIN.MAIL_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          to: mailState.form.to,
          ...(mailState.form.cc && { cc: mailState.form.cc }),
        }),
      });

      const data = await res.json();
      const message =
        data.message ||
        (res.ok ? "Test mail sent successfully" : "Failed to send test mail");
      showSnackbar(message, res.ok ? "success" : "error");

      if (res.ok) {
        mailState.resetForm();
        mailState.setResponse(data.message);
        setTimeout(() => mailState.setResponse(null), 5000);
      }
    } catch (error) {
      showSnackbar("Failed to send test mail", "error");
    } finally {
      mailState.setLoading(false);
    }
  }, [mailState, showSnackbar]);

  const handleTestWhatsapp = useCallback(async () => {
    if (!whatsappState.form.phone) {
      showSnackbar("Please enter phone number", "error");
      return;
    }

    whatsappState.setLoading(true);
    whatsappState.setResponse(null);

    try {
      const res = await fetch(apiConfig.SUPER_ADMIN.WHATSAPP_TEST, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          phone: whatsappState.form.phone,
          message:
            whatsappState.form.message || STRINGS.WHATSAPP_TEST_MESSAGE,
        }),
      });

      const data = await res.json();
      const message =
        data.message ||
        (res.ok
          ? "WhatsApp test message sent successfully"
          : "Failed to send WhatsApp message");
      showSnackbar(message, res.ok ? "success" : "error");

      if (res.ok) {
        whatsappState.resetForm();
        whatsappState.setResponse(data.message);
        setTimeout(() => whatsappState.setResponse(null), 5000);
      }
    } catch (error) {
      showSnackbar("Failed to send WhatsApp message", "error");
    } finally {
      whatsappState.setLoading(false);
    }
  }, [whatsappState, showSnackbar]);

  const tools = useMemo(
    () => [
      {
        id: "mail",
        title: "Mail Test",
        icon: <MailIcon sx={{ color: "#D44638" }} />,
        content: (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test email functionality and configurations
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextFieldComponent
                label="To Email"
                name="to"
                value={mailState.form.to}
                onChange={mailState.handleChange}
                required
                type="email"
              />
              <TextFieldComponent
                label="CC Email (Optional)"
                name="cc"
                value={mailState.form.cc}
                onChange={mailState.handleChange}
                type="email"
              />
              <ButtonComponent
                variant="contained"
                onClick={handleTestMail}
                disabled={mailState.loading}
                sx={{ alignSelf: "flex-start" }}
                color="success"
              >
                {mailState.loading ? "Sending..." : "Send Test Mail"}
              </ButtonComponent>

              {mailState.loading && <Loader />}

              {mailState.response && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "success.light",
                    color: "success.contrastText",
                    mt: 2,
                  }}
                >
                  <Typography variant="body2">{mailState.response}</Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ),
      },
      {
        id: "whatsapp",
        title: "WhatsApp Test",
        icon: <WhatsAppIcon sx={{ color: "#25D366" }} />,
        content: (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Test WhatsApp integration and message delivery
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextFieldComponent
                label="Phone Number"
                name="phone"
                value={whatsappState.form.phone}
                onChange={whatsappState.handleChange}
                required
                placeholder="Include country code"
              />
              <TextFieldComponent
                label="Message (Optional)"
                name="message"
                value={whatsappState.form.message}
                onChange={whatsappState.handleChange}
                multiline
                rows={3}
              />
              <ButtonComponent
                variant="contained"
                onClick={handleTestWhatsapp}
                disabled={whatsappState.loading}
                sx={{ alignSelf: "flex-start" }}
                color="success"
              >
                {whatsappState.loading ? "Sending..." : "Send Test Message"}
              </ButtonComponent>

              {whatsappState.loading && <Loader />}

              {whatsappState.response && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: "success.light",
                    color: "success.contrastText",
                    mt: 2,
                  }}
                >
                  <Typography variant="body2">
                    {whatsappState.response}
                  </Typography>
                </Paper>
              )}
            </Box>
          </Box>
        ),
      },
    ],
    [mailState, whatsappState, handleTestMail, handleTestWhatsapp]
  );

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Typography variant="h6" gutterBottom>
        Developer Tools
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
          alignItems: "flex-start",
        }}
      >
        {tools.map((tool) => (
          <Card
            key={tool.id}
            sx={{
              minWidth: 300,
              display: "flex",
              flexDirection: "column",
              "&:hover": {
                boxShadow: 3,
              },
            }}
          >
            <CardContent sx={{ p: 2, flexGrow: 1 }}>
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
              <Collapse
                in={expanded[tool.id]}
                unmountOnExit
                sx={{
                  "& > .MuiCollapse-wrapper": {
                    display: "block !important",
                  },
                }}
              >
                {tool.content}
              </Collapse>
            </CardContent>
          </Card>
        ))}
      </Box>

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
