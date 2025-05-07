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
  TablePagination,
  Typography,
} from "@mui/material";

const DataTable = ({
  data = [],
  loading = false,
  columns = [],
  page = 0,
  rowsPerPage = 10,
  onPageChange = () => { },
  onRowsPerPageChange = () => { },
  totalCount = null,
}) => {
  // For client-side pagination fallback
  const paginatedData =
    totalCount == null
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

  return (
    <Paper sx={{ width: "100%", overflow: "auto", p: { xs: 1, sm: 2 } }}>
      <TableContainer
        sx={{
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
              paginatedData.map((row, rowIndex) => (
                <TableRow key={row.id || rowIndex}>
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
                      {col.field === "sl_no"
                        ? page * rowsPerPage + rowIndex + 1
                        : row[col.field]}
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
