import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Divider, Switch, Fab, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableComponent from "../../../components/TableComponent";
import Loader from "../../../components/Loader";
import SnackbarAlert from "../../../components/SnackbarAlert";
import ModalComponent from "../../../components/ModalComponent";
import apiConfig from "../../../config/apiConfig";
import SearchFieldComponent from "../../../components/SearchFieldComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import SelectFieldComponent from "../../../components/SelectFieldComponent";

const categoryOptions = [
  { label: "Snacks", value: "snacks" },
  { label: "Food Item", value: "food_item" },
];

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const controllerRef = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState(null);
  const [newItemDescription, setNewItemDescription] = useState("");

  const fetchItems = useCallback(
    async (
      q = "",
      page = pagination.current_page,
      perPage = pagination.per_page
    ) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const token = localStorage.getItem("token");
      const newController = new AbortController();
      controllerRef.current = newController;

      setLoading(true);
      setInitialLoad(true);

      try {
        const params = new URLSearchParams({
          page,
          per_page: perPage,
          q: q.trim(),
        }).toString();

        const res = await fetch(`${apiConfig.ITEMS_LIST}?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: newController.signal,
        });

        const data = await res.json();

        if (res.ok && data.success) {
          setItems(data.items || []);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
            current_page: data.pagination?.current_page || page,
            per_page: data.pagination?.per_page || perPage,
          }));
        } else {
          throw new Error(data.message || "Failed to load data");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnack({
            open: true,
            severity: "error",
            message: error.message || "Failed to load data",
          });
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [pagination.current_page, pagination.per_page]
  );

  useEffect(() => {
    fetchItems(searchTerm, pagination.current_page, pagination.per_page);
  }, [searchTerm, pagination.current_page, pagination.per_page, fetchItems]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const token = localStorage.getItem("token");
    const newStatus = currentStatus === 1 ? 0 : 1;

    setLoading(true);

    try {
      const res = await fetch(`${apiConfig.UPDATE_ITEM_STATUS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );

      setSnack({
        open: true,
        severity: "success",
        message: "Status updated successfully",
      });
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to update status",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim() || !newItemCategory) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please enter item name and select category",
      });
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(apiConfig.CREATE_ITEM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newItemName.trim(),
          category: newItemCategory.value,
          description: newItemDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create item");
      }

      setSnack({
        open: true,
        severity: "success",
        message: "Item created successfully",
      });
      setModalOpen(false);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      fetchItems(searchTerm, 1, pagination.per_page);
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to create item",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      field: "name",
      headerName: "Item",
      width: 400,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      headerAlign: "right",
      align: "right",
      renderCell: (params) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Switch
            checked={params.row.status === 1}
            onChange={() =>
              handleToggleStatus(params.row.id, params.row.status)
            }
            color="primary"
            inputProps={{ "aria-label": "status toggle" }}
          />
        </Box>
      ),
    },
  ];

  const modalContent = (
    <Box component="form" sx={{ mt: 1 }} noValidate autoComplete="off">
      <TextFieldComponent
        label="Item Name"
        value={newItemName}
        onChange={(e) => setNewItemName(e.target.value)}
        required
        margin="normal"
        autoFocus
      />
      <SelectFieldComponent
        label="Category"
        value={newItemCategory}
        onChange={(e) => setNewItemCategory(e.target.value)}
        required
        margin="normal"
        options={categoryOptions}
        valueKey="value"
        displayKey="label"
      />
      <TextFieldComponent
        label="Description (Optional)"
        value={newItemDescription}
        onChange={(e) => setNewItemDescription(e.target.value)}
        multiline
        rows={3}
        margin="normal"
        placeholder="Add a description for the item"
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={() => setModalOpen(false)} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleCreateItem}>
          Create
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Items List
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
          maxWidth: 1200,
          width: "100%",
        }}
      >
        <Box sx={{ width: 300 }}>
          <SearchFieldComponent
            label="Search"
            placeholder="Search items..."
            onSearch={handleSearch}
            delay={0}
            size="small"
          />
        </Box>
      </Box>

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      <Box sx={{ position: "relative" }}>
        {loading || initialLoad || (items.length === 0 && !loading) ? (
          <Loader message="Loading..." />
        ) : (
          <TableComponent
            rows={items}
            columns={columns}
            total={pagination.total}
            page={pagination.current_page - 1}
            rowsPerPage={pagination.per_page}
            onPaginationChange={handlePaginationChange}
          />
        )}
      </Box>

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => {
          setNewItemName("");
          setNewItemCategory(null);
          setNewItemDescription("");
          setModalOpen(true);
        }}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon />
      </Fab>

      <ModalComponent
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Item"
        content={modalContent}
      />
    </Box>
  );
};

export default ItemsList;
