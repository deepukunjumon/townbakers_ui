import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Grid,
  Autocomplete,
  TextField,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";
import ButtonComponent from "../../components/ButtonComponent";
import Loader from "../../components/Loader";
import ConfirmDialog from "../../components/ConfirmDialog";
import { STRINGS } from "../../constants/strings";
import { debounce } from "lodash";

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
  const [loading, setLoading] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [employeeInputValue, setEmployeeInputValue] = useState("");
  const [itemInputValue, setItemInputValue] = useState("");

  const branchId = getBranchIdFromToken();
  const token = getToken();

  const titleCase = (str) => {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const debouncedSearchEmployeesRef = useRef();
  const debouncedSearchItemsRef = useRef();

  useEffect(() => {
    const fetchEmployees = async (searchTerm) => {
      try {
        const url = searchTerm.trim()
          ? `${apiConfig.MINIMAL_EMPLOYEES}?q=${encodeURIComponent(searchTerm)}`
          : `${apiConfig.MINIMAL_EMPLOYEES}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        setEmployeeList(data?.employees || []);
        return true;
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load employees",
        });
        return false;
      }
    };

    const fetchItems = async (searchTerm) => {
      setItemList([]);
      try {
        const url = searchTerm.trim()
          ? `${apiConfig.MINIMAL_ITEMS}?q=${encodeURIComponent(searchTerm)}`
          : `${apiConfig.MINIMAL_ITEMS}`;

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        const filteredItems = data.items.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setItemList(filteredItems || []);
        return true;
      } catch (error) {
        console.error("Failed to fetch items:", error);
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load items",
        });
        return false;
      }
    };

    debouncedSearchEmployeesRef.current = debounce(fetchEmployees, 300);
    debouncedSearchItemsRef.current = debounce(fetchItems, 300);

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [employeesSuccess, itemsSuccess] = await Promise.all([
          fetchEmployees(""),
          fetchItems(""),
        ]);

        if (employeesSuccess && itemsSuccess) {
          setLoading(false);
        } else {
          throw new Error("Failed to load initial data");
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load initial data",
        });
        setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      if (debouncedSearchEmployeesRef.current) {
        debouncedSearchEmployeesRef.current.cancel();
      }
      if (debouncedSearchItemsRef.current) {
        debouncedSearchItemsRef.current.cancel();
      }
    };
  }, [token, setEmployeeList, setItemList, setSnack]);

  const handleAddItem = () => {
    if (!selectedItem || !quantity || Number(quantity) <= 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Select item and enter valid quantity",
      });
      return;
    }

    const existingIndex = addedItems.findIndex(
      (item) => item.id === selectedItem.id
    );

    if (existingIndex !== -1) {
      const updatedItems = [...addedItems];
      updatedItems[existingIndex].quantity =
        Number(updatedItems[existingIndex].quantity) + Number(quantity);
      setAddedItems(updatedItems);
    } else {
      setAddedItems([
        ...addedItems,
        { ...selectedItem, quantity: Number(quantity) },
      ]);
    }

    setSelectedItem(null);
    setItemInputValue("");
    setQuantity("");
  };

  const handleRemoveItem = (id) => {
    setAddedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmModalOpen(false);
    setLoading(true);

    let itemsToSubmit = [...addedItems];

    if (!employeeId) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Select an employee",
      });
      setLoading(false);
      return;
    }

    if (itemsToSubmit.length === 0) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Add at least one item",
      });
      setLoading(false);
      return;
    }

    const payload = {
      branch_id: branchId,
      employee_id: employeeId.id,
      items: itemsToSubmit.map(({ id, quantity }) => ({
        item_id: id,
        quantity,
      })),
    };

    try {
      const res = await fetch(`${apiConfig.ADD_STOCK}`, {
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
        setItemInputValue("");
        setQuantity("");
      }
    } catch (error) {
      console.error("Network error during submission:", error);
      setSnack({ open: true, severity: "error", message: "Network error" });
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationDialogProps = () => {
    return {
      title: "Confirm Submission",
      content: STRINGS.SUBMIT_CONFIRMATION,
      type: "info",
      confirmText: "Submit",
      confirmColor: "primary",
    };
  };

  return (
    <Box sx={{ maxWidth: "auto" }}>
      {loading && <Loader message="Loading..." />}

      {!loading && (
        <>
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
                <Autocomplete
                  options={employeeList}
                  getOptionLabel={(option) =>
                    option
                      ? `${option.employee_code} - ${titleCase(option.name)}`
                      : ""
                  }
                  value={employeeId}
                  onChange={(event, newValue) => {
                    setEmployeeId(newValue);
                  }}
                  inputValue={employeeInputValue}
                  onInputChange={(event, newInputValue) => {
                    setEmployeeInputValue(newInputValue);
                    debouncedSearchEmployeesRef.current(newInputValue);
                  }}
                  filterOptions={(options) => options}
                  isOptionEqualToValue={(option, value) =>
                    value && option.id === value.id
                  }
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      sx={{ "& > div": { mr: 2, flexShrink: 0 } }}
                      {...props}
                      key={option.id}
                    >
                      <Grid
                        container
                        sx={{
                          alignItems: "center",
                        }}
                      >
                        <Grid item xs>
                          <span style={{ fontWeight: 400 }}>
                            {titleCase(option.name)} (Code:{" "}
                            {option.employee_code})
                          </span>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Employee"
                      required
                      sx={{ mb: 2, width: "100%" }}
                    />
                  )}
                />

                <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                  Add Item
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={7}>
                    <Autocomplete
                      options={itemList}
                      getOptionLabel={(option) => option.name || ""}
                      value={selectedItem}
                      onChange={(event, newValue) => {
                        setSelectedItem(newValue);
                      }}
                      inputValue={itemInputValue}
                      onInputChange={(event, newInputValue) => {
                        setItemInputValue(newInputValue);
                        debouncedSearchItemsRef.current(newInputValue);
                      }}
                      filterOptions={(options) => options}
                      isOptionEqualToValue={(option, value) =>
                        value && option.id === value.id
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Item"
                          sx={{ width: { xs: 150, sm: 348 } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      inputProps={{ min: 0.1 }}
                      sx={{ width: { xs: 90, sm: 250 } }}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <ButtonComponent
                      onClick={handleAddItem}
                      size="medium"
                      variant="contained"
                      color="primary"
                      type="button"
                      endIcon={<AddIcon />}
                    >
                      Add
                    </ButtonComponent>
                  </Grid>
                </Grid>
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
                  <>
                    <List dense>
                      {addedItems.map((item) => (
                        <ListItem
                          key={item.id}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              color="error"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={item.name}
                            secondary={`Quantity: ${item.quantity}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 1.5 }} />
                    <Box 
                      sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        color: 'text.secondary'
                      }}
                    >
                      <Typography variant="subtitle2">
                        Total Items
                      </Typography>
                      <Typography variant="subtitle2">
                        {addedItems.length}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ 
              display: "flex", 
              gap: 2, 
              mt: 4,
              justifyContent: "center",
              maxWidth: 400,
              mx: "auto"
            }}>
              <ButtonComponent
                type="button"
                size="medium"
                variant="outlined"
                color="primary"
                sx={{ 
                  minWidth: 120,
                  px: 3
                }}
                onClick={() => setAddedItems([])}
              >
                Clear
              </ButtonComponent>
              <ButtonComponent
                type="submit"
                size="medium"
                disabled={addedItems.length === 0}
                variant="contained"
                color="primary"
                sx={{ 
                  minWidth: 120,
                  px: 3
                }}
              >
                Submit
              </ButtonComponent>
            </Box>
          </form>

          <ConfirmDialog
            open={confirmModalOpen}
            onClose={() => setConfirmModalOpen(false)}
            onConfirm={handleConfirmSubmit}
            {...getConfirmationDialogProps()}
          />
        </>
      )}
    </Box>
  );
};

export default AddStock;
