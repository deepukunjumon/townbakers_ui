import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import apiConfig from "../../config/apiConfig";
import SnackbarAlert from "../../components/SnackbarAlert";

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const groupedSettings = Object.entries(settings).reduce((acc, [key, setting]) => {
        const category = setting.category || "general";
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push({ key, ...setting });
        return acc;
    }, {});

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(apiConfig.SETTINGS, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch settings");
            }

            const result = await response.json();
            if (result.success) {
                setSettings(result.data);
            } else {
                throw new Error(result.message || "Failed to fetch settings");
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
            setSnackbar({
                open: true,
                message: "Failed to fetch settings: " + error.message,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        try {
            setUpdating(prev => ({ ...prev, [key]: true }));

            const currentSetting = settings[key];

            const response = await fetch(apiConfig.UPDATE_SETTING, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    settings: [{
                        key: key,
                        value: value,
                        type: currentSetting.type,
                        category: currentSetting.category,
                        description: currentSetting.description
                    }]
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update setting");
            }

            const result = await response.json();
            if (result.success) {
                setSettings(prev => ({
                    ...prev,
                    [key]: { ...prev[key], value: value.toString() }
                }));
                setSnackbar({
                    open: true,
                    message: "Setting updated successfully",
                    severity: "success",
                });
            } else {
                throw new Error(result.message || "Failed to update setting");
            }
        } catch (error) {
            console.error("Error updating setting:", error);
            setSnackbar({
                open: true,
                message: "Failed to update setting: " + error.message,
                severity: "error",
            });
        } finally {
            setUpdating(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleValueChange = async (key, value) => {
        // If boolean, convert to 1/0
        const settingType = settings[key]?.type;
        let newValue = value;
        if (settingType === "boolean") {
            newValue = value ? 1 : 0;
        }
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value: newValue }
        }));
        await updateSetting(key, newValue);
    };

    const renderSettingField = (setting) => {
        const { key, value, type, description } = setting;
        const isUpdating = updating[key];

        switch (type) {
            case "boolean":
                return (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={value === 1 || value === "1"}
                                onChange={(e) => handleValueChange(key, e.target.checked)}
                                disabled={isUpdating}
                            />
                        }
                        label=""
                    />
                );

            case "number":
                return (
                    <TextField
                        type="number"
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        disabled={isUpdating}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 120 }}
                    />
                );

            case "json":
                return (
                    <TextField
                        multiline
                        rows={2}
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        disabled={isUpdating}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 200 }}
                        helperText="Enter valid JSON format"
                    />
                );

            default:
                return (
                    <TextField
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        disabled={isUpdating}
                        variant="outlined"
                        size="small"
                        sx={{ minWidth: 200 }}
                    />
                );
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" component="h1">
                    System Settings
                </Typography>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Configure system-wide settings. Changes will be applied immediately.
            </Alert>

            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
                <Accordion key={category} defaultExpanded sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6" sx={{ textTransform: "capitalize" }}>
                            {category} Settings
                        </Typography>
                        <Chip
                            label={categorySettings.length}
                            size="small"
                            sx={{ ml: 2 }}
                        />
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0 }}>
                        <Paper variant="outlined">
                            {categorySettings.map((setting, index) => (
                                <Box key={setting.key}>
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        p: 2,
                                        minHeight: 64
                                    }}>
                                        <Box sx={{ flex: 1, mr: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                                <Typography variant="subtitle" sx={{ fontWeight: 500, textTransform: "capitalize" }}>
                                                    {setting.key.replace(/_/g, " ")}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" color="textSecondary">
                                                {setting.description}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Last updated: {new Date(setting.updated_at).toLocaleString()}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", alignItems: "center" }}>
                                            {renderSettingField(setting)}
                                        </Box>
                                    </Box>
                                    {index < categorySettings.length - 1 && <Divider />}
                                </Box>
                            ))}
                        </Paper>
                    </AccordionDetails>
                </Accordion>
            ))}

            <SnackbarAlert
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Box>
    );
};

export default Settings; 