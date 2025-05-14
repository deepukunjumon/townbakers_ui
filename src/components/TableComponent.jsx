import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";

const TableComponent = ({
  columns,
  rows,
  total,
  page,
  rowsPerPage,
  onPaginationChange,
  onRowClick,
  noDataMessage = "No data found",
}) => {
  const handleChangePage = (event, newPage) => {
    onPaginationChange({ page: newPage + 1, rowsPerPage });
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    onPaginationChange({ page: 1, rowsPerPage: newRowsPerPage });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TableContainer
        sx={{ maxHeight: { md: 400 }, flex: 1, overflow: "auto" }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  bgcolor: "background.default",
                  fontWeight: "fontWeightMedium",
                  zIndex: 2,
                }}
              >
                #
              </TableCell>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    position: "sticky",
                    top: 0,
                    bgcolor: "background.default",
                    fontWeight: "fontWeightMedium",
                    zIndex: 2,
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
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    "&:last-child td": { borderBottom: 0 },
                  }}
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
                <TableCell
                  colSpan={columns.length + 1}
                  sx={{
                    textAlign: "center",
                    color: "text.disabled",
                    py: 2,
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
        rowsPerPageOptions={[5, 10, 25, 50]}
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
        }}
      />
    </div>
  );
};

export default TableComponent;
