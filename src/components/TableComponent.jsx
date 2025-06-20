import React from "react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

const TableComponent = ({
  columns,
  rows,
  total,
  page,
  rowsPerPage,
  onPaginationChange,
  onRowClick,
  onEdit,
  onView,
  onDelete,
  noDataMessage = "No data found",
  showActions = true,
  deleteConfirmMessage = "Are you sure you want to delete this item?",
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const handleChangePage = (event, newPage) => {
    onPaginationChange({ page: newPage + 1, rowsPerPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onPaginationChange({ page: 1, rowsPerPage: newRowsPerPage });
  };

  const handleDeleteClick = (row) => {
    setSelectedItem(row);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedItem);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const tableColumns = [...columns];
  if (showActions && (onEdit || onView || onDelete)) {
    tableColumns.push({
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      renderCell: ({ row }) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          {onView && (
            <Tooltip title="View">
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(row);
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(row);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(row);
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TableContainer
        sx={{
          height: { xs: "100%", sm: "auto" },
          maxHeight: { xs: "none", sm: 400 },
          overflow: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          "& .MuiTable-root": {
            height: { xs: "100%", sm: "auto" },
          },
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  bgcolor: "grey.100",
                  fontWeight: "bold",
                  zIndex: 2,
                  width: 80,
                  minWidth: 80,
                  textAlign: "center",
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                Sl.No
              </TableCell>
              {tableColumns.map((col) => (
                <TableCell
                  key={col.field}
                  align={col.headerAlign || "left"}
                  sx={{
                    position: "sticky",
                    top: 0,
                    bgcolor: "grey.100",
                    fontWeight: "bold",
                    zIndex: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    width: col.width || "auto",
                    minWidth: col.minWidth || "auto",
                    maxWidth: col.maxWidth || "auto",
                    ...col.sx,
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, idx) => (
                <TableRow
                  key={row.id || idx}
                  hover={!!(onRowClick || onView || onEdit)}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:hover": {
                      backgroundColor: "grey.50",
                    },
                    "&:nth-of-type(odd)": {
                      backgroundColor: "grey.50",
                    },
                  }}
                >
                  <TableCell
                    sx={{
                      width: 80,
                      minWidth: 80,
                      textAlign: "center",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {page * rowsPerPage + idx + 1}
                  </TableCell>
                  {tableColumns.map((col) => (
                    <TableCell
                      key={col.field}
                      align={col.align || "left"}
                      sx={{
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        width: col.width || "auto",
                        minWidth: col.minWidth || "auto",
                        maxWidth: col.maxWidth || "auto",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        ...col.cellSx,
                      }}
                    >
                      {col.renderCell
                        ? col.renderCell({ value: row[col.field], row })
                        : col.type === "date" && row[col.field]
                        ? dayjs(row[col.field]).format("DD-MM-YYYY")
                        : row[col.field] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={tableColumns.length + 1}
                  sx={{
                    textAlign: "center",
                    color: "text.disabled",
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          ".MuiTablePagination-displayedRows, .MuiTablePagination-selectLabel":
            {
              fontSize: {
                xs: "0.85rem",
                sm: "0.9rem",
              },
            },
          ".MuiIconButton-root": {
            padding: {
              xs: "2px",
              sm: "8px",
            },
            fontSize: {
              xs: "0.85rem",
              sm: "0.9rem",
            },
          },
          ".MuiSelect-select": {
            fontSize: {
              xs: "0.85rem",
              sm: "0.9rem",
            },
          },
        }}
      />

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
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

export default TableComponent;
