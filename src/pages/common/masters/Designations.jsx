import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Divider,
  TextField,
  Switch,
  Button,
  CircularProgress,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableComponent from "../../../components/TableComponent";
import SnackbarAlert from "../../../components/SnackbarAlert";
import Loader from "../../../components/Loader";
import SelectFieldComponent from "../../../components/SelectFieldComponent";
import ModalComponent from "../../../components/ModalComponent";
import ChipComponent from "../../../components/ChipComponent";
import apiConfig from "../../../config/apiConfig";
import { STRINGS } from "../../../constants/strings";

const statusOptions = [
  { name: "All", id: "" },
  { name: "Active", id: "1" },
  { name: "Disabled", id: "0" },
  { name: "Deleted", id: "-1" },
];

const Designations = () => {
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [statusFilter, setStatusFilter] = useState(statusOptions[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);
  const controllerRef = useRef(null);

  const [loadingSwitches, setLoadingSwitches] = useState({});
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState({
    id: null,
    currentStatus: null,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [newDesignation, setNewDesignation] = useState("");

  const fetchDesignations = useCallback(
    async (
      status = statusFilter.id,
      q = searchTerm,
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
        });

        if (status) {
          params.append("status", status);
        }
        if (q.trim()) {
          params.append("q", q.trim());
        }

        const res = await fetch(
          `${apiConfig.DESIGNATIONS}?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: newController.signal,
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          setDesignations(data.designations || []);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
            current_page: data.pagination?.current_page || page,
            per_page: data.pagination?.per_page || perPage,
          }));
        } else {
          throw new Error(data.message || "Failed to load designations");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSnack({
            open: true,
            severity: "error",
            message: error.message || "Failed to load designations",
          });
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [pagination.current_page, pagination.per_page, statusFilter.id, searchTerm]
  );

  useEffect(() => {
    fetchDesignations();
  }, [fetchDesignations]);

  const handleToggleStatus = async (id, currentStatus) => {
    setConfirmModalOpen(true);
    setConfirmPayload({ id, currentStatus });
  };

  const handleConfirmToggle = async () => {
    const { id, currentStatus } = confirmPayload;
    if (!id) {
      setConfirmModalOpen(false);
      return;
    }

    setConfirmModalOpen(false);
    const newStatus = currentStatus === 1 ? 0 : 1;
    setLoadingSwitches((prev) => ({ ...prev, [id]: true }));

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(apiConfig.UPDATE_DESIGNATION_STATUS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setDesignations((prevDesignations) =>
        prevDesignations.map((designation) =>
          designation.id === id
            ? { ...designation, status: newStatus }
            : designation
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
      setLoadingSwitches((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }
  };

  const columns = [
    {
      field: "designation",
      headerName: "Designation",
      flex: 1,
      headerAlign: "left",
      align: "left",
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const status = Number(params.row.status);
        let chipProps = {
          size: "small",
        };

        switch (status) {
          case 1:
            chipProps = {
              ...chipProps,
              label: "Active",
              color: "success",
            };
            break;
          case 0:
            chipProps = {
              ...chipProps,
              label: "Disabled",
              color: "warning",
            };
            break;
          case -1:
            chipProps = {
              ...chipProps,
              label: "Deleted",
              color: "error",
            };
            break;
          default:
            chipProps = {
              ...chipProps,
              label: "Unknown",
              color: "default",
            };
        }

        return (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <ChipComponent {...chipProps} />
          </Box>
        );
      },
    },
    {
      field: "toggle",
      headerName: "",
      flex: 1,
      sortable: false,
      filterable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        const statusNum = Number(params.row.status);
        const isLoading = !!loadingSwitches[params.row.id];
        if (statusNum !== 0 && statusNum !== 1) return null;
        return (
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Switch
              checked={statusNum === 1}
              onChange={() => {
                if (!isLoading) {
                  handleToggleStatus(params.row.id, statusNum);
                }
              }}
              size="medium"
              color="primary"
              disabled={isLoading}
            />
            {isLoading && (
              <CircularProgress
                size={24}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: "-12px",
                  marginLeft: "-12px",
                  pointerEvents: "none",
                }}
              />
            )}
          </Box>
        );
      },
    },
  ];

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleStatusChange = (event) => {
    const selectedStatus = event.target.value || statusOptions[0];
    setStatusFilter(selectedStatus);
    setPagination((prev) => ({
      ...prev,
      current_page: 1,
    }));
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 500);
  };

  const handleCreateDesignation = async () => {
    if (!newDesignation.trim()) {
      setSnack({
        open: true,
        severity: "warning",
        message: "Please enter designation name",
      });
      return;
    }

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch(apiConfig.CREATE_DESIGNATION, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          designation: newDesignation.trim(),
          status: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create designation");
      }

      setSnack({
        open: true,
        severity: "success",
        message: "Designation created successfully",
      });
      setModalOpen(false);
      setNewDesignation("");
      setPagination((prev) => ({ ...prev, current_page: 1 }));
      fetchDesignations();
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "Failed to create designation",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmationModalContent = (
    <Box>
      {confirmPayload.currentStatus === 1
        ? STRINGS.DISABLE_DESIGNATION
        : STRINGS.ENABLE_DESIGNATION}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
        <Button variant="text" onClick={() => setConfirmModalOpen(false)}>
          Cancel
        </Button>
        <Button variant="text" onClick={handleConfirmToggle} autoFocus>
          Confirm
        </Button>
      </Box>
    </Box>
  );

  const modalContent = (
    <Box component="form" sx={{ mt: 1 }} noValidate autoComplete="off">
      <TextField
        label="Designation Name"
        value={newDesignation}
        onChange={(e) => setNewDesignation(e.target.value)}
        required
        fullWidth
        margin="normal"
        autoFocus
      />
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button onClick={() => setModalOpen(false)} sx={{ mr: 1 }}>
          Cancel
        </Button>
        <Button variant="text" onClick={handleCreateDesignation}>
          Create
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Designations
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Box sx={{ width: { xs: 100, md: 200 } }}>
          <SelectFieldComponent
            label="Status"
            name="status"
            value={statusFilter}
            onChange={handleStatusChange}
            options={statusOptions}
            valueKey="id"
            displayKey="name"
            fullWidth
          />
        </Box>

        <Box sx={{ width: 300 }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            onChange={handleSearchChange}
            placeholder="Search designations..."
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
        {loading || initialLoad ? (
          <Loader message="Loading..." />
        ) : (
          <TableComponent
            rows={designations}
            columns={columns}
            rowIdField="id"
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
          setNewDesignation("");
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
        open={confirmModalOpen}
        onClose={() => {}}
        hideCloseIcon={true}
        title={STRINGS.CONFIRM_ACTION}
        content={confirmationModalContent}
      />

      <ModalComponent
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create New Designation"
        content={modalContent}
      />
    </Box>
  );
};

export default Designations;
