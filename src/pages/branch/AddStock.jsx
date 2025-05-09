import React, { useEffect, useState } from "react";
import { Box, Grid, Typography, Divider, IconButton, useMediaQuery, useTheme } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SnackbarAlert from "../../components/SnackbarAlert";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import TextFieldComponent from "../../components/TextFieldComponent";
import ButtonComponent from "../../components/ButtonComponent";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";

const AddStock = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const branchId = getBranchIdFromToken();
  const [employeeId, setEmployeeId] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  const [itemList, setItemList] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [selectedQty, setSelectedQty] = useState("");
  const [items, setItems] = useState([]);
  const [snack, setSnack] = useState({ open: false, severity: "info", message: "" });
  const [loading, setLoading] = useState({ employees: false, items: false });

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken();
      try {
        setLoading(prev => ({ ...prev, employees: true }));

        // Fetch employees
        const empResponse = await fetch(`${apiConfig.BASE_URL}/employees/minimal`, {
          headers: { Authorization: token },
        });

        if (!empResponse.ok) {
          const errorData = await empResponse.json();
          throw new Error(errorData.message || "Employee fetch failed");
        }

        const empData = await empResponse.json();
        const formattedEmployees = (empData.employees || []).map(emp => ({
          id: emp.id,
          name: `${emp.employee_code} - ${emp.name}`,
          employee_code: emp.employee_code
        }));

        setEmployeeList(formattedEmployees);

        // Fetch items
        setLoading(prev => ({ ...prev, items: true }));
        const itemResponse = await fetch(`${apiConfig.BASE_URL}/items/list`, {
          headers: { Authorization: token },
        });

        if (!itemResponse.ok) throw new Error("Item fetch failed");
        const itemData = await itemResponse.json();
        setItemList(itemData.items || []);

      } catch (error) {
        console.error("Fetch error:", error);
        setSnack({
          open: true,
          severity: "error",
          message: error.message || "Failed to load data"
        });
      } finally {
        setLoading({ employees: false, items: false });
      }
    };

    fetchData();
  }, []);

  const handleAddItem = () => {
    if (!selectedItemId || !selectedQty || selectedQty <= 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please select an item and enter valid quantity",
      });
      return;
    }

    const quantity = parseFloat(selectedQty);
    const existingItemIndex = items.findIndex(item => item.item_id === selectedItemId);

    if (existingItemIndex !== -1) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
    } else {
      // Add new item
      const selectedItem = itemList.find(item => item.id === selectedItemId);
      setItems([...items, {
        item_id: selectedItemId,
        name: selectedItem?.name || "Unknown Item",
        quantity: quantity
      }]);
    }

    // Reset selection
    setSelectedItemId("");
    setSelectedQty("");
  };

  const handleDeleteItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) return;

    const updatedItems = [...items];
    updatedItems[index].quantity = parseFloat(newQuantity);
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please select an employee",
      });
      return;
    }

    if (items.length === 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please add at least one item",
      });
      return;
    }

    try {
      const payload = {
        branch_id: branchId,
        employee_id: employeeId,
        items: items.map(({ item_id, quantity }) => ({ item_id, quantity }))
      };

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
        message: data.message || (res.ok ? "Stock added successfully" : "Submission failed"),
      });

      if (res.ok) {
        setEmployeeId("");
        setItems([]);
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: "Network error: " + error.message
      });
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack(prev => ({ ...prev, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Typography variant="h5" gutterBottom>
        Add Stock Entry
      </Typography>

      <Divider sx={{ my: 2 }} />

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Form Column */}
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Employee Selection */}
              <SelectFieldComponent
                label="Employee"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                options={employeeList}
                valueKey="id"
                displayKey="name"
                loading={loading.employees}
                fullWidth
                required
              />

              {/* Item Addition Section */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Add Item
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={7}>
                    <SelectFieldComponent
                      label="Item"
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value)}
                      options={itemList}
                      valueKey="id"
                      displayKey="name"
                      loading={loading.items}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextFieldComponent
                      label="Qty"
                      type="number"
                      value={selectedQty}
                      onChange={(e) => setSelectedQty(e.target.value)}
                      InputProps={{
                        inputProps: { min: 0.01, step: "any" }
                      }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      color="primary"
                      onClick={handleAddItem}
                      disabled={!selectedItemId || !selectedQty}
                      size="large"
                    >
                      <AddCircleIcon fontSize="large" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>

              {/* Submit Button */}
              <ButtonComponent
                type="submit"
                variant="contained"
                color="primary"
                disabled={items.length === 0 || !employeeId}
                fullWidth
                sx={{ mt: 2 }}
              >
                Submit
              </ButtonComponent>
            </Box>
          </Grid>

          {/* Summary Column */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                bgcolor: "background.paper",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                minHeight: isMobile ? "auto" : "400px"
              }}
            >
              <Typography variant="h6" gutterBottom>
                Item Summary ({items.length} items)
              </Typography>

              {items.length > 0 && (
                <>
                  <Grid container sx={{ gap: 10, fontWeight: 'bold', pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                    <Grid item xs={7}>
                      Item
                    </Grid>
                    <Grid item xs={3}>
                      Quantity
                    </Grid>
                    <Grid item xs={2}>
                      {/* Optional: Add label for action like "Delete" */}
                    </Grid>
                  </Grid>

                  <Box sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: isMobile ? '300px' : 'none' }}>
                    {items.map((item, index) => (
                      <Grid container key={`${item.item_id}-${index}`} alignItems="center" sx={{ py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                        <Grid item xs={7}>
                          <Typography>{item.name}</Typography>
                        </Grid>
                        <Grid item xs={3}>
                          <TextFieldComponent
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(index, e.target.value)}
                            InputProps={{
                              inputProps: { min: 0.01, step: "any" },
                              sx: { height: '40px' }
                            }}
                            sx={{ width: '100%' }}
                          />
                        </Grid>
                        <Grid item xs={2} sx={{ textAlign: 'center' }}>
                          <IconButton
                            onClick={() => handleDeleteItem(index)}
                            color="error"
                            size="small"
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                  </Box>
                </>
              )}

              {items.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No items added yet
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default AddStock;