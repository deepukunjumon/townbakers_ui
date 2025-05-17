import React from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const ExportMenu = ({ anchorEl, open, onClose, onExportClick, disabled }) => (
  <>
    <IconButton onClick={(e) => onExportClick(e)} disabled={disabled}>
      <MoreVertIcon />
    </IconButton>
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      <MenuItem disabled={disabled} onClick={() => onExportClick("excel")}>
        <ListItemIcon>
          <FileDownloadIcon sx={{ color: "green" }} />
        </ListItemIcon>
        <ListItemText primary="Export Excel" />
      </MenuItem>
      <MenuItem disabled={disabled} onClick={() => onExportClick("pdf")}>
        <ListItemIcon>
          <PictureAsPdfIcon sx={{ color: "red" }} />
        </ListItemIcon>
        <ListItemText primary="Export PDF" />
      </MenuItem>
    </Menu>
  </>
);

export default ExportMenu;
