import React, { useEffect, useState } from "react";
import {
    Box, TextField, Button, Typography, Grid, IconButton, MenuItem
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getBranchIdFromToken } from "../../utils/auth";

const AddStock = () => {
    const branchId = getBranchIdFromToken();
    const [employeeId, setEmployeeId] = useState("");
    const [employeeList, setEmployeeList] = useState([]);
    const [items, setItems] = useState([{ item_id: "", quantity: "" }]);
    const [itemList, setItemList] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });

    // Fetch employees and items on mount
    useEffect(() => {
        const token = localStorage.getItem("token");

        const fetchEmployees = async () => {
            try {
                const res = await fetch(`${apiConfig.BASE_URL}/employees/minimal`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setEmployeeList(data.employees || []);
                else throw new Error();
            } catch {
                setSnack({ open: true, severity: "error", message: "Failed to fetch employees" });
            }
        };

        const fetchItems = async () => {
            try {
                const res = await fetch(`${apiConfig.BASE_URL}/items/list`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setItemList(data.items || []);
                else throw new Error();
            } catch {
                setSnack({ open: true, severity: "error", message: "Failed to fetch items" });
            }
        };

        fetchEmployees();
        fetchItems();
    }, []);

    const handleItemChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;
        setItems(updated);
    };

    const addItem = () => setItems([...items, { item_id: "", quantity: "" }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            branch_id: branchId,
            employee_id: employeeId,
            items,
        };

        try {
            const res = await fetch(`${apiConfig.BASE_URL}/stock/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            setSnack({
                open: true,
                severity: res.ok ? "success" : "error",
                message: data.message || "Error submitting stock",
            });

            if (res.ok) {
                setItems([{ item_id: "", quantity: "" }]);
                setEmployeeId("");
            }
        } catch {
            setSnack({ open: true, severity: "error", message: "Network error while submitting" });
        }
    };

    return (
        <Box>
            <SnackbarAlert
                open={snack.open}
                onClose={() => setSnack((s) => ({ ...s, open: false }))}
                severity={snack.severity}
                message={snack.message}
            />

            <Typography variant="h5" gutterBottom>Add Stock</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    select
                    label="Employee"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    fullWidth
                    margin="normal"
                    required
                >
                    {employeeList.map((emp) => (
                        <MenuItem key={emp.id} value={emp.id}>
                            {emp.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="h6" sx={{ mt: 2 }}>Items</Typography>
                {items.map((item, index) => (
                    <Grid container spacing={2} key={index} alignItems="center">
                        <Grid item xs={5}>
                            <TextField
                                select
                                label="Item"
                                value={item.item_id}
                                onChange={(e) => handleItemChange(index, "item_id", e.target.value)}
                                fullWidth
                                required
                            >
                                {itemList.map((itm) => (
                                    <MenuItem key={itm.id} value={itm.id}>
                                        {itm.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                label="Quantity"
                                type="number"
                                inputProps={{ min: "0.01", step: "0.01" }}
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                fullWidth
                                required
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <IconButton onClick={() => removeItem(index)} disabled={items.length === 1}>
                                <RemoveCircleOutlineIcon />
                            </IconButton>
                            {index === items.length - 1 && (
                                <IconButton onClick={addItem}>
                                    <AddCircleOutlineIcon />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                ))}

                <Button type="submit" variant="contained" color="primary" sx={{ mt: 3 }}>
                    Submit
                </Button>
            </form>
        </Box>
    );
};

export default AddStock;
