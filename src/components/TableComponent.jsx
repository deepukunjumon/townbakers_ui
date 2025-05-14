import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from "@mui/material";

const TableComponent = ({
  columns,
  rows,
  total,
  page, // Current page (0-based index)
  rowsPerPage, // Rows per page
  onPaginationChange,
  onRowClick,
  noDataMessage = "No data found.", // Default message for empty data
}) => {
  const handleChangePage = (event, newPage) => {
    onPaginationChange({ page: newPage + 1, rowsPerPage }); // Convert to 1-based index for Laravel
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onPaginationChange({ page: 1, rowsPerPage: newRowsPerPage }); // Reset to page 1 when rows per page changes
  };

  return (
    <Paper>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "background.paper",
                  zIndex: 1,
                }}
              >
                Sl. No.
              </TableCell>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "background.paper",
                    zIndex: 1,
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
                  key={row.id || idx} // Use `row.id` if available, fallback to `idx`
                  hover
                  onClick={() => onRowClick && onRowClick(row)} // Only call `onRowClick` if provided
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  <TableCell>{page * rowsPerPage + idx + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.field}>
                      {row[col.field] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={total} // Total number of rows from the API
        rowsPerPage={rowsPerPage} // Rows per page
        page={page} // Current page (0-based index)
        onPageChange={handleChangePage} // Handle page change
        onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
      />
    </Paper>
  );
};

export default TableComponent;