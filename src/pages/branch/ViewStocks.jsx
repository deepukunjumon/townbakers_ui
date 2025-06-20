import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Typography, Divider, Button, Accordion, AccordionSummary, AccordionDetails, FormControl, RadioGroup, FormControlLabel, Radio, useTheme, useMediaQuery } from "@mui/material";
import format from "date-fns/format";
import SnackbarAlert from "../../components/SnackbarAlert";
import Loader from "../../components/Loader";
import apiConfig from "../../config/apiConfig";
import TableComponent from "../../components/TableComponent";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import ExportMenu from "../../components/ExportMenu";
import { getToken } from "../../utils/auth";
import TextFieldComponent from "../../components/TextFieldComponent";
import ButtonComponent from "../../components/ButtonComponent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SendIcon from "@mui/icons-material/Send";

const ViewStocks = () => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [date, setDate] = useState(new Date());
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [searchTerm, setSearchTerm] = useState("");
  const searchTimeout = useRef(null);

  const [sendMode, setSendMode] = useState("normal");
  const [sendCC, setSendCC] = useState("");
  const [sending, setSending] = useState(false);

  const [sendReportMessage, setSendReportMessage] = useState("");
  const [sendReportSeverity, setSendReportSeverity] = useState("success");

  const handleExportClick = (eventOrType) => {
    if (typeof eventOrType === "string") {
      handleExport(eventOrType);
    } else {
      setAnchorEl(eventOrType.currentTarget);
    }
  };

  const handleExportClose = () => setAnchorEl(null);

  const handleExport = (type) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = `${apiConfig.STOCK_SUMMARY}`;

    const addField = (name, value) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    const token = localStorage.getItem("token");
    if (token) addField("token", token);
    addField("date", formattedDate);
    addField("export", "true");
    addField("type", type);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    handleExportClose();
  };

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    const formattedDate = format(date, "yyyy-MM-dd");

    try {
      const res = await fetch(
        `${apiConfig.STOCK_SUMMARY}?page=${pagination.current_page}&per_page=${pagination.per_page}&q=${encodeURIComponent(searchTerm.trim())}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
          body: JSON.stringify({ date: formattedDate }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStockData(data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          current_page: data.pagination?.current_page || 1,
          per_page: data.pagination?.per_page || 10,
        }));
        setSnack({
          open: true,
          severity: "success",
          message: data.message || "Stock summary loaded",
        });
      } else {
        setStockData([]);
        setSnack({
          open: true,
          severity: "error",
          message: data.message || "Error fetching stocks",
        });
      }
    } catch (err) {
      setSnack({
        open: true,
        severity: "error",
        message: "Network error",
      });
    } finally {
      setLoading(false);
    }
  }, [date, pagination.current_page, pagination.per_page, searchTerm]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleDateChange = (newDate) => {
    setDate(newDate);
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    setStockData([]);
  };

  const handlePaginationChange = ({ page, rowsPerPage }) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
      per_page: rowsPerPage,
    }));
  };

  const handleRefresh = () => {
    fetchStocks();
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearchTerm(value);
      setPagination((prev) => ({ ...prev, current_page: 1 }));
    }, 300);
  };

  const handleSendReport = async () => {
    setSending(true);
    setSendReportMessage("");
    try {
      const token = localStorage.getItem("token");
      let payload = {};
      if (date) payload.date = format(date, "yyyy-MM-dd");
      if (sendMode === "custom" && sendCC) {
        payload.cc = sendCC.split(',').map(email => email.trim()).filter(Boolean);
      }
      const res = await fetch(apiConfig.SEND_STOCK_SUMMARY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSendReportMessage(data.message || "Report sent successfully!");
        setSendReportSeverity("success");
      } else {
        throw new Error(data.message || "Failed to send report");
      }
    } catch (err) {
      setSendReportMessage(err.message || "Failed to send report");
      setSendReportSeverity("error");
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { field: "item_name", headerName: "Item", flex: 2 },
    {
      field: "total_quantity",
      headerName: "Total Quantity",
      flex: 1,
      align: "right",
      headerAlign: "right",
    },
  ];

  return (
    <Box sx={{ maxWidth: "auto" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Stock Summary</Typography>
        <ExportMenu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleExportClose}
          onExportClick={handleExportClick}
          disabled={stockData.length === 0}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      {/* Filter Row */}
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
        alignItems="center"
        my={2}
      >
        <Box display="flex" gap={2} flexWrap="wrap">
          <DateSelectorComponent
            sx={{ width: { xs: "100%", sm: 220 } }}
            value={date}
            maxDate={new Date()}
            onChange={handleDateChange}
          />
          <ButtonComponent
            onClick={handleRefresh}
            variant="contained"
            color="primary"
            sx={{ height: "54px", minWidth: "auto" }}
          >
            Refresh
          </ButtonComponent>
        </Box>

        {stockData.length > 0 && (
          <Box sx={{ width: { xs: "100%", sm: 320 } }}>
            <TextFieldComponent
              label="Search"
              variant="outlined"
              onChange={handleSearchChange}
              placeholder="Search items..."
              fullWidth
            />
          </Box>
        )}
      </Box>

      <Box gap={2} my={2}>
        {stockData.length > 0 && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>More Actions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl component="fieldset">
                <RadioGroup
                  row
                  value={sendMode}
                  onChange={e => setSendMode(e.target.value)}
                >
                  <FormControlLabel value="normal" control={<Radio />} label="Normal mode" />
                  <FormControlLabel value="custom" control={<Radio />} label="Custom mode" />
                </RadioGroup>
              </FormControl>
              {sendMode === "custom" && (
                <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                  <TextFieldComponent
                    label="Additional Emails (CC)"
                    value={sendCC}
                    onChange={(e) => setSendCC(e.target.value)}
                    placeholder="Comma separated emails"
                    multiline={isXs}
                    rows={isXs ? 2 : undefined}
                    sx={{ width: { xs: "100%", sm: "80%" } }}
                  />
                </Box>
              )}
              <Box mt={2} display="flex" alignItems="center" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendReport}
                  disabled={sending}
                  startIcon={<SendIcon />}
                >
                  {sending ? "Sending..." : "Send Report"}
                </Button>
                {sending && <Loader message="Sending Report..." />}
              </Box>
              {sendReportMessage && (
                <Typography
                  sx={{ mt: 2 }}
                  color={sendReportSeverity === "success" ? "success.main" : "error.main"}
                >
                  {sendReportMessage}
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        )}
      </Box>

      {loading && <Loader message="Loading..." />}

      {!loading && (
        <TableComponent
          rows={stockData}
          columns={columns}
          total={pagination.total}
          page={pagination.current_page - 1}
          rowsPerPage={pagination.per_page}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </Box>
  );
};

export default ViewStocks;
