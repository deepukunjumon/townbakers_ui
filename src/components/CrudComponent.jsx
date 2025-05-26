import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import TableComponent from "./TableComponent";

const CrudComponent = ({
  data,
  columns,
  title,
  onAdd,
  onEdit,
  onView,
  onDelete,
  loading,
  total,
  page,
  rowsPerPage,
  onPaginationChange,
  addButtonText = "Add New",
  viewButtonText = "View",
  editButtonText = "Edit",
  deleteButtonText = "Delete",
  deleteConfirmMessage = "Are you sure you want to delete this item?",
}) => {
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedItem);
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const enhancedColumns = [
    ...columns,
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {onView && (
            <Tooltip title={viewButtonText}>
              <IconButton color="primary" onClick={() => onView(params.row)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title={editButtonText}>
              <IconButton color="secondary" onClick={() => onEdit(params.row)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title={deleteButtonText}>
              <IconButton
                color="error"
                onClick={() => handleDeleteClick(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {onAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            {addButtonText}
          </Button>
        )}
      </Box>

      <TableComponent
        rows={data}
        columns={enhancedColumns}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPaginationChange={onPaginationChange}
        loading={loading}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>{deleteConfirmMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrudComponent;
