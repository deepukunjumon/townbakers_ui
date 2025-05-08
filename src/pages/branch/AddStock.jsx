import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Typography,
    Button,
    IconButton,
    MenuItem,
    Divider,
    TextField,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SnackbarAlert from "../../components/SnackbarAlert";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import TextFieldComponent from "../../components/TextFieldComponent";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";

const AddStock = () => {
    const branchId = getBranchIdFromToken();
    const [employeeId, setEmployeeId] = useState("");
    const [employeeList, setEmployeeList] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [items, setItems] = useState([{ item_id: "", quantity: "" }]);
    const [snack, setSnack] = useState({
        open: false,
        severity: "info",
        message: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch(`${apiConfig.BASE_URL}/employees/minimal`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setEmployeeList(data.employees || []))
            .catch(() =>
                setSnack({
                    open: true,
                    severity: "error",
                    message: "Failed to load employees",
                })
            );

        fetch(`${apiConfig.BASE_URL}/items/list`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => setItemList(data.items || []))
            .catch(() =>
                setSnack({
                    open: true,
                    severity: "error",
                    message: "Failed to load items",
                })
            );
    }, []);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...items];
        updatedItems[index][field] = value;
        setItems(updatedItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { branch_id: branchId, employee_id: employeeId, items };

        try {
            const res = await fetch(`${apiConfig.BASE_URL}/stock/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: getToken(),
                },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setSnack({
                open: true,
                severity: res.ok ? "success" : "error",
                message: data.message || "Submission failed",
            });
            if (res.ok) {
                setEmployeeId("");
                setItems([{ item_id: "", quantity: "" }]);
            }
        } catch {
            setSnack({ open: true, severity: "error", message: "Network error" });
        }
    };

    return (
        <Box sx={{ maxWidth: 720, mx: "auto", py: 2, px: 2 }}>
            <SnackbarAlert
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                severity={snack.severity}
                message={snack.message}
            />

            <Typography variant="h5" gutterBottom>
                Add Stock Entry
            </Typography>

            <Divider sx={{ my: 2 }} />

            <form onSubmit={handleSubmit}>
                <TextField
                    select
                    label="Select Employee"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    fullWidth
                    required
                    size="small"
                    margin="dense"
                >
                    {employeeList.length === 0 ? (
                        <MenuItem disabled>Loading...</MenuItem>
                    ) : (
                        employeeList.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                                {emp.employee_code} - {emp.name}
                            </MenuItem>
                        ))
                    )}
                </TextField>

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                    Item Details
                </Typography>

                {items.map((item, index) => (
                    <Grid
                        container
                        spacing={1.5}
                        alignItems="center"
                        key={index}
                        sx={{ mb: 1 }}
                    >
                        <Grid item xs={12} sm={5}>
                            <SelectFieldComponent
                                label="Item"
                                value={item.item_id}
                                onChange={(e) =>
                                    handleItemChange(index, "item_id", e.target.value)
                                }
                                options={itemList}
                                valueKey="id"
                                displayKey="name"
                                required
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} sm={5}>
                            <TextFieldComponent
                                label="Quantity"
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                    handleItemChange(index, "quantity", e.target.value)
                                }
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={2}>
                            <IconButton
                                onClick={() =>
                                    setItems((prev) => prev.filter((_, i) => i !== index))
                                }
                                disabled={items.length === 1}
                                color="error"
                            >
                                <DeleteOutlineIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}

                <Button
                    startIcon={<AddCircleIcon />}
                    onClick={() => setItems([...items, { item_id: "", quantity: "" }])}
                    sx={{ mt: 1, mb: 2 }}
                    size="small"
                >
                    Add Another Item
                </Button>

                <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                    Submit Stock
                </Button>
            </form>
        </Box>
    );
};

export default AddStock;
