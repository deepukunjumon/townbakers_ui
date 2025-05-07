import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const TableComponent = ({ columns, rows }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Sl. No.</TableCell>
          {columns.map((col) => (
            <TableCell key={col.field}>{col.headerName}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length > 0 ? (
          rows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{idx + 1}</TableCell>
              {columns.map((col) => (
                <TableCell key={col.field}>
                  {row[col.field] ?? "-"}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length + 1}>No data found.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
);

export default TableComponent;
