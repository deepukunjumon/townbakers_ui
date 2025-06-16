import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, Divider, Switch, Fab, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import TableComponent from "../../../components/TableComponent";
import Loader from "../../../components/Loader";
import SnackbarAlert from "../../../components/SnackbarAlert";
import ModalComponent from "../../../components/ModalComponent";
import apiConfig from "../../../config/apiConfig";
import SearchFieldComponent from "../../../components/SearchFieldComponent";
import TextFieldComponent from "../../../components/TextFieldComponent";
import SelectFieldComponent from "../../../components/SelectFieldComponent";
import ImportMenuComponent from "../../../components/ImportMenuComponent";
import ButtonComponent from "../../../components/ButtonComponent";
import IconButtonComponent from "../../../components/IconButtonComponent";
import { STRINGS } from "../../../constants/strings";
import { debounce } from "lodash";

const categoryOptions = [
  { label: "Snacks", value: "snacks" },
  { label: "Cake", value: "cake" },
  { label: "Food Item", value: "food_item" },
];

const ItemsList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const paginationRef = useRef(pagination);
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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const debouncedFetchItemsRef = useRef();

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const fetchItems = useCallback(
    async (
      q = "",
      page = paginationRef.current.current_page,
      perPage = paginationRef.current.per_page
    ) => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      const token = localStorage.getItem("token");
      const newController = new AbortController();
      controllerRef.current = newController;

      setLoading(true);

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
      }
    },
    [setItems, setPagination, setSnack, controllerRef]
  );

  useEffect(() => {
    debouncedFetchItemsRef.current = debounce(fetchItems, 300);

    debouncedFetchItemsRef.current(
      "",
      pagination.current_page,
      pagination.per_page
    );

    return () => {
      if (debouncedFetchItemsRef.current) {
        debouncedFetchItemsRef.current.cancel();
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [fetchItems, pagination.current_page, pagination.per_page]);

  useEffect(() => {
    debouncedFetchItemsRef.current(
      searchTerm,
      pagination.current_page,
      pagination.per_page
    );
  }, [searchTerm, pagination.current_page, pagination.per_page]);

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
    fetchItems(searchTerm, page, rowsPerPage);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const item = items.find((item) => item.id === id);
    setSelectedItem({ id, currentStatus, name: item.name });
    setConfirmModalOpen(true);
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
    setSelectedItem(null);
  };

  const confirmToggleStatus = async () => {
    if (!selectedItem) return;

    const token = localStorage.getItem("token");
    const newStatus = selectedItem.currentStatus === 1 ? 0 : 1;

    setLoading(true);

    try {
      const res = await fetch(`${apiConfig.UPDATE_ITEM_STATUS}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: selectedItem.id, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status");
      }

      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id ? { ...item, status: newStatus } : item
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
      handleConfirmCancel();
    }
  };

  const handleEditClick = (item) => {
    setNewItemName(item.name);
    setNewItemCategory({ value: item.category, label: item.category });
    setNewItemDescription(item.description || "");
    setSelectedItem(item);
    setIsEditMode(true);
    setModalOpen(true);
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
      const url = isEditMode
        ? apiConfig.UPDATE_ITEM_DETAILS(selectedItem.id)
        : apiConfig.CREATE_ITEM;

      const res = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
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
        throw new Error(
          data.error || `Failed to ${isEditMode ? "update" : "create"} item`
        );
      }

      setSnack({
        open: true,
        severity: "success",
        message: `Item ${isEditMode ? "updated" : "created"} successfully`,
      });
      setModalOpen(false);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      await fetchItems(searchTerm, 1, pagination.per_page);
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message:
          error.message || `Failed to ${isEditMode ? "update" : "create"} item`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setNewItemName("");
    setNewItemCategory(null);
    setNewItemDescription("");
    setSelectedItem(null);
    setIsEditMode(false);
  };

  const handleImportClick = () => {
    setImportModalOpen(true);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setImporting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(apiConfig.IMPORT_ITEMS, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to import items");
      }

      setImportResult({
        success: data.success,
        message: data.message,
        errors: data.errors || [],
      });

      await fetchItems(searchTerm, 1, pagination.per_page);
    } catch (error) {
      setImportResult({
        success: false,
        message: error.message || "Failed to import items",
        errors: [],
      });
    } finally {
      setImporting(false);
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
      field: "category",
      headerName: "Category",
      width: 300,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Switch
            size="small"
            checked={params.row.status === 1}
            onChange={() =>
              handleToggleStatus(params.row.id, params.row.status)
            }
            color="primary"
            inputProps={{ "aria-label": "status toggle" }}
          />

          <IconButtonComponent
            icon={EditIcon}
            onClick={() => handleEditClick(params.row)}
            title="Edit"
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
        <Button onClick={handleModalClose} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant="text" onClick={handleCreateItem}>
          {isEditMode ? "Update" : "Create"}
        </Button>
      </Box>
    </Box>
  );

  const renderConfirmationModal = () => (
    <ModalComponent
      open={confirmModalOpen}
      hideCloseIcon={true}
      onClose={handleConfirmCancel}
      title="Confirm Status Change"
      content={
        <Box>
          <Typography>
            {selectedItem?.currentStatus === 1
              ? STRINGS.DISABLE_ITEM_CONFIRMATION(selectedItem?.name)
              : STRINGS.ENABLE_ITEM_CONFIRMATION(selectedItem?.name)}
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <ButtonComponent
              variant="text"
              color="primary"
              onClick={handleConfirmCancel}
              sx={{ mr: 1 }}
            >
              {STRINGS.CANCEL}
            </ButtonComponent>
            <ButtonComponent
              variant="text"
              color={selectedItem?.currentStatus === 1 ? "error" : "success"}
              onClick={confirmToggleStatus}
            >
              {selectedItem?.currentStatus === 1
                ? STRINGS.DISABLE
                : STRINGS.ENABLE}
            </ButtonComponent>
          </Box>
        </Box>
      }
    />
  );

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Items List
        </Typography>
        <ImportMenuComponent onImportClick={handleImportClick} />
      </Box>
      <Divider sx={{ mb: 3 }} />

      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "flex-end",
          width: "100%",
        }}
      >
        <Box sx={{ width: { xs: "100%", sm: 300 } }}>
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
        {loading ? (
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

      {renderConfirmationModal()}

      <ModalComponent
        open={modalOpen}
        onClose={handleModalClose}
        title={isEditMode ? "Edit Item" : "Create New Item"}
        content={modalContent}
      />

      <ModalComponent
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setFile(null);
          setImportResult(null);
        }}
        title="Import Items"
        content={
          <Box>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              disabled={importing}
            />
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              sx={{ mt: 2 }}
              variant="contained"
            >
              {importing ? "Importing..." : "Import"}
            </Button>
            <Box sx={{ mb: 2 }}>
              <a
                href={`${apiConfig.BASE_URL}/../sample-files/items.xlsx`}
                download
                style={{ textDecoration: "underline", color: "#1976d2" }}
                rel="noopener noreferrer"
              >
                Sample File
              </a>
            </Box>
            {importResult && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  color={importResult.success ? "success.main" : "error.main"}
                >
                  {importResult.message}
                </Typography>
                {importResult.errors && importResult.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Errors:</Typography>
                    <ul>
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>
                          Row {err.row}: {Object.values(err.errors).join(", ")}
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default ItemsList;
