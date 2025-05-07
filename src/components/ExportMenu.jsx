import React from "react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const ExportMenu = ({ anchorEl, open, onClose, onExportClick }) => (
  <>
    <IconButton onClick={(e) => onExportClick(e)}>
      <MoreVertIcon />
    </IconButton>
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem onClick={() => onExportClick("excel")}>Download Excel</MenuItem>
      <MenuItem onClick={() => onExportClick("pdf")}>Download PDF</MenuItem>
    </Menu>
  </>
);

export default ExportMenu;
