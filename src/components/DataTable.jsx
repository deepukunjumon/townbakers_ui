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
  useTheme,
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
  const theme = useTheme();

  const paginatedData =
    totalCount == null
      ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : data;

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        p: { xs: 1, sm: 2 },
        borderRadius: 3,
      }}
      elevation={3}
    >
      <TableContainer
        sx={{
          maxHeight: 500,
          borderRadius: 3,
        }}
      >
        <Table sx={{ minWidth: 650, tableLayout: "auto" }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.field || col.headerName}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: "#fff",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    width: col.width || "auto",
                    maxWidth: col.width || "auto",
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
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: col.width || "auto",
                        maxWidth: col.width || "auto",
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
