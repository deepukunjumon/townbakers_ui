import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import apiConfig from "../../config/apiConfig";
import { getToken, getBranchIdFromToken } from "../../utils/auth";
import ButtonComponent from "../../components/ButtonComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import TextFieldComponent from "../../components/TextFieldComponent";
import DateSelectorComponent from "../../components/DateSelectorComponent";
import TimePickerComponent from "../../components/TimePickerComponent";
import axios from "axios";

const initialFormState = {
  title: "",
  description: "",
  remarks: "",
  order_date: new Date().toISOString().split("T")[0],
  delivery_date: null,
  delivery_time: null,
  customer_name: "",
  customer_email: "",
  customer_mobile: "",
  total_amount: "",
  advance_amount: "",
  employee: "",
};

const CreateOrder = () => {
  const branchId = getBranchIdFromToken();
  const [employeeList, setEmployeeList] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [paymentStatus, setPaymentStatus] = useState("0");
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  useEffect(() => {
    axios
      .get(`${apiConfig.BASE_URL}/employees/minimal`, {
        headers: { Authorization: getToken() },
      })
      .then((res) => setEmployeeList(res.data.employees || []))
      .catch(() =>
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to load employees",
        })
      );
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date, name) => {
    setForm({ ...form, [name]: date });
  };

  const handleTimeChange = (time, name) => {
    if (!time) {
      setForm({ ...form, [name]: null });
      return;
    }

    if (time instanceof Date) {
      const hours = String(time.getHours()).padStart(2, "0");
      const minutes = String(time.getMinutes()).padStart(2, "0");
      setForm({ ...form, [name]: `${hours}:${minutes}` });
      return;
    }

    if (typeof time === "string" && time.match(/^\d{2}:\d{2}$/)) {
      setForm({ ...form, [name]: time });
      return;
    }

    setForm({ ...form, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const delivery = new Date(form.delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (delivery < today) {
      setSnack({
        open: true,
        severity: "error",
        message: "Delivery date cannot be in the past.",
      });
      return;
    }

    const formatTime = (date) => {
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    const payload = {
      ...form,
      employee_id: form.employee?.id || null,
      branch_id: branchId,
      delivery_date: form.delivery_date
        ? new Date(form.delivery_date).toISOString().split("T")[0]
        : "",
      delivery_time: form.delivery_time || "",
      payment_status: parseInt(paymentStatus),
    };

    try {
      const res = await axios.post(
        `${apiConfig.BASE_URL}/branch/create/order`,
        payload,
        {
          headers: { Authorization: getToken() },
        }
      );

      setSnack({
        open: true,
        severity: "success",
        message: res.data.message || "Order created successfully",
      });

      setForm(initialFormState);
      setPaymentStatus("2");
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.response?.data?.message || "Order creation failed.",
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", my: 4, px: { xs: -3 } }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />

      {/* Header */}
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Grid item>
          <Typography variant="h5" fontWeight={600}>
            Create New Order
          </Typography>
        </Grid>
        <Grid item sx={{ width: 250, mt: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Date: {new Date(form.order_date).toLocaleDateString("en-GB")}
          </Typography>
        </Grid>
      </Grid>
      <form onSubmit={handleSubmit}>
        {/* Order Details */}
        <Grid container spacing={3} gap={{ xs: 0 }}>
          <Grid item xs={12} sm={8}>
            <TextFieldComponent
              label="Order Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextFieldComponent
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              multiline
              rows={3}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Delivery Details */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Delivery Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DateSelectorComponent
              label="Delivery Date"
              name="delivery_date"
              value={form.delivery_date}
              onChange={handleDateChange}
              minDate={new Date()}
              sx={{ minWidth: { xs: 340 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePickerComponent
              label="Delivery Time"
              name="delivery_time"
              value={form.delivery_time}
              onChange={(time) => handleTimeChange(time, "delivery_time")}
              sx={{ minWidth: { xs: 340 } }}
              required
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Customer Info */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Customer Details
        </Typography>

        <Grid container spacing={3} gap={{ xs: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              label="Customer Name"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              label="Customer Mobile"
              name="customer_mobile"
              value={form.customer_mobile}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Customer Email"
              name="customer_email"
              value={form.customer_email}
              onChange={handleChange}
              sx={{ minWidth: { xs: 340 } }}
              type="email"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Financial Details */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Financial Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} sx={{ width: 150 }}>
            <TextFieldComponent
              label="Total Amount"
              name="total_amount"
              type="number"
              value={form.total_amount}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Grid>

          {paymentStatus === "1" && (
            <Grid item xs={12} sm={6} sx={{ mt: 0, width: 150 }}>
              <TextFieldComponent
                label="Advance Amount"
                name="advance_amount"
                type="number"
                value={form.advance_amount}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{
                  min: 0,
                  max: form.total_amount || undefined,
                  step: 0.01,
                }}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6} sx={{ mt: -3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Payment
            </Typography>
            <RadioGroup
              row
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <FormControlLabel
                value="2"
                control={<Radio />}
                label="Full paid"
              />
              <FormControlLabel
                value="1"
                control={<Radio />}
                label="Advance Only"
              />
              <FormControlLabel value="0" control={<Radio />} label="Unpaid" />
            </RadioGroup>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Assigned Employee */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Assigned Employee
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <SelectFieldComponent
              label="employee"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              options={employeeList}
              valueKey="id"
              displayKey="name"
              required
              fullWidth
              sx={{ minWidth: { xs: 340 } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <ButtonComponent
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 5, py: 1.5, fontSize: "1rem" }}
          >
            Create Order
          </ButtonComponent>
        </Box>
      </form>
    </Box>
  );
};

export default CreateOrder;
