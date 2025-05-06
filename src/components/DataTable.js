import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Chip,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { getStatusChipProps } from "../utils/statusMappings";
import { userStatusMap } from "../constants/status";

const DELETED_STATUS_VALUE = -1;
const DELETED_STATUS_LABEL =
  userStatusMap[DELETED_STATUS_VALUE]?.label || "Deleted";

const DataTable = ({
  data = [],
  loading = false,
  columns = [],
  onSearch = () => {},
  onStatusFilter = () => {},
  searchValue = "",
  statusValue = "",
  statusType = "user", // e.g. 'user', 'order', etc.
  statusField = "status", // which field to use for status
  statusOptions = [
    { value: "", label: "All" },
    { value: 1, label: "Active" },
    { value: 0, label: "Disabled" },
    { value: -1, label: "Deleted" },
  ],
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => {},
  onRowsPerPageChange = () => {},
  totalCount = null, // for server-side pagination
  onEdit = () => {}, // callback for edit
  onDelete = () => {}, // callback for delete
}) => {
  // For client-side pagination, slice the data
  const paginatedData =
    totalCount == null
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 }, width: "100%", overflow: "auto" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
      >
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: "100%", sm: 300 } }}
        />
        <FormControl
          size="small"
          sx={{ minWidth: 140, width: { xs: "100%", sm: 140 } }}
        >
          <InputLabel>Status</InputLabel>
          <Select
            value={statusValue}
            label="Status"
            onChange={(e) => onStatusFilter(e.target.value)}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <TableContainer
        sx={{
          maxWidth: "100vw",
          maxHeight: 500,
          overflowX: "auto",
          overflowY: "auto",
        }}
      >
        <Table sx={{ minWidth: 650, tableLayout: "auto" }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field || col.headerName}
                  sx={{
                    position: "sticky",
                    top: 0,
                    background: "#fff",
                    zIndex: 2,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    borderBottom: "2px solid #e0e0e0",
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2">No data found.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.field || col.headerName}
                      sx={{
                        whiteSpace: "nowrap",
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {col.headerName === "Actions" ||
                      col.field === "actions" ? (
                        row.status === DELETED_STATUS_VALUE ||
                        row.status === DELETED_STATUS_LABEL ? null : (
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              aria-label="edit"
                              color="primary"
                              onClick={() => onEdit(row)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              aria-label="delete"
                              color="error"
                              onClick={() => onDelete(row)}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        )
                      ) : col.field === statusField ? (
                        <Chip
                          {...getStatusChipProps(statusType, row[col.field])}
                        />
                      ) : (
                        row[col.field]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalCount == null ? data.length : totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        sx={{ mt: 2 }}
      />
    </Paper>
  );
};

export default DataTable;
