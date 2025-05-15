import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Grid,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";
import ButtonComponent from "../../components/ButtonComponent";

const AddStock = () => {
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const branchId = getBranchIdFromToken();

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

  const handleAddItem = () => {
    if (!selectedItem || !quantity || Number(quantity) <= 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Select item and enter valid quantity",
      });
      return;
    }
    const alreadyAdded = addedItems.find(
      (i) => i.item_id.id === selectedItem.id
    );
    if (alreadyAdded) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Item already added",
      });
      return;
    }
    setAddedItems([
      ...addedItems,
      { item_id: selectedItem, quantity: Number(quantity) },
    ]);
    setSelectedItem(null);
    setQuantity("");
  };

  const handleRemoveItem = (id) => {
    setAddedItems((prev) => prev.filter((i) => i.item_id.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedItems = [...addedItems];

    if (selectedItem && quantity && Number(quantity) > 0) {
      const alreadyAdded = updatedItems.find(
        (i) => i.item_id.id === selectedItem.id
      );
      if (!alreadyAdded) {
        updatedItems.push({
          item_id: selectedItem,
          quantity: Number(quantity),
        });
      }
    }

    if (!employeeId) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Select an employee",
      });
      return;
    }

    if (updatedItems.length === 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Add at least one item",
      });
      return;
    }

    const payload = {
      branch_id: branchId,
      employee_id: employeeId.id,
      items: updatedItems.map(({ item_id, quantity }) => ({
        item_id: item_id.id,
        quantity,
      })),
    };

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
        setEmployeeId(null);
        setAddedItems([]);
        setSelectedItem(null);
        setQuantity("");
      }
    } catch {
      setSnack({ open: true, severity: "error", message: "Network error" });
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 2, px: 2 }}>
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
        <Box
          sx={{
            width: "100%",
            minHeight: "70vh",
            display: "flex",
            gap: 4,
            flexDirection: { xs: "column", md: "row" },
          }}
        >
          {/* Left: Form */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              maxWidth: 600,
              px: { xs: 0, md: 4 },
              py: 2,
            }}
          >
            <SelectFieldComponent
              label="Select Employee"
              value={employeeId}
              onChange={(e) => {
                const emp = employeeList.find(
                  (item) =>
                    item.id === (e?.target?.value?.id ?? e?.target?.value) ||
                    null
                );
                setEmployeeId(emp || null);
              }}
              options={employeeList}
              valueKey="id"
              displayKey={(emp) => `${emp.employee_code} - ${emp.name}`}
              required
              sx={{ mb: 2, width: { xs: "100%", sm: 260 } }}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Add Item
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <SelectFieldComponent
                  label="Item"
                  value={selectedItem}
                  onChange={(e) => {
                    const val = e?.target?.value;
                    const item =
                      itemList.find((i) => i.id === (val?.id ?? val)) || null;
                    setSelectedItem(item);
                  }}
                  options={itemList}
                  valueKey="id"
                  displayKey="name"
                  sx={{ width: { xs: 150, sm: 260 } }}
                />
              </Grid>
              <Grid item xs={8} sm={3} sx={{ mt: 1 }}>
                <TextFieldComponent
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  inputProps={{ min: 0.1 }}
                  sx={{ width: { xs: 85, sm: 100 } }}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <ButtonComponent
                  onClick={handleAddItem}
                  sx={{ height: 50, minWidth: 0 }}
                  size="medium"
                  variant="contained"
                  color="primary"
                  type="button"
                >
                  Add
                </ButtonComponent>
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <ButtonComponent
                type="submit"
                size="medium"
                disabled={addedItems.length === 0}
                variant="contained"
                color="primary"
                sx={{ mt: 4, height: 50, minWidth: 180 }}
              >
                Submit
              </ButtonComponent>
            </Box>
          </Box>
          {/* Right: Live Preview */}
          <Box
            sx={{
              flex: 1,
              bgcolor: "#f5f5f5",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.main",
              p: 3,
              minHeight: 400,
              maxWidth: 600,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              overflowY: "auto",
              maxHeight: { xs: 300, md: 500 },
            }}
          >
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Items Preview
            </Typography>
            {addedItems.length === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No items added yet.
              </Typography>
            ) : (
              <List dense>
                {addedItems.map((item) => (
                  <ListItem
                    key={item.item_id.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveItem(item.item_id.id)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={item.item_id.name}
                      secondary={`Quantity: ${item.quantity}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default AddStock;
