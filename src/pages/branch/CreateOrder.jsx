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
import Loader from "../../components/Loader";
import axios from "axios";
import { format } from "date-fns";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${apiConfig.MINIMAL_EMPLOYEES}`, {
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
    setLoading(true);

    const delivery = new Date(form.delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (delivery < today) {
      setSnack({
        open: true,
        severity: "error",
        message: "Delivery date cannot be in the past.",
      });
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      employee_id: form.employee?.id || null,
      branch_id: branchId,
      delivery_date: form.delivery_date
        ? format(new Date(form.delivery_date), "yyyy-MM-dd")
        : "",
      delivery_time: form.delivery_time || "",
      payment_status: parseInt(paymentStatus),
    };

    try {
      const res = await axios.post(
        `${apiConfig.CREATE_ORDER}`,
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", p: 2 }}>
      {loading && <Loader message="Creating Order..." />}
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />
      <Typography variant="h5" gutterBottom>
        Create Order
      </Typography>
      <Grid item sx={{ width: 250, mt: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          Date: {new Date(form.order_date).toLocaleDateString("en-GB")}
        </Typography>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        {/* Order Details */}
        <Typography
          variant="subtitle1"
          sx={{ mb: 2, fontWeight: 500, color: "text.secondary" }}
        >
          Order Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              label="Order Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              sx={{ minWidth: { xs: 320, sm: "auto" } }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              multiline
              rows={3}
              sx={{ minWidth: { xs: 320 } }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextFieldComponent
              label="Remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              multiline
              rows={3}
              sx={{ minWidth: { xs: 320 } }}
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
              sx={{ minWidth: { xs: 320 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TimePickerComponent
              label="Delivery Time"
              name="delivery_time"
              value={form.delivery_time}
              onChange={(time) => handleTimeChange(time, "delivery_time")}
              sx={{ minWidth: { xs: 320 } }}
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

        <Grid
          container
          spacing={3}
          gap={{ xs: 0, sm: 3 }}
          pr={{ xs: 0, sm: 3 }}
        >
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              label="Customer Name"
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              sx={{ minWidth: { xs: 320 } }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextFieldComponent
              label="Customer Mobile"
              name="customer_mobile"
              value={form.customer_mobile}
              onChange={handleChange}
              sx={{ minWidth: { xs: 320 } }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextFieldComponent
              label="Customer Email"
              name="customer_email"
              value={form.customer_email}
              onChange={handleChange}
              sx={{ minWidth: { xs: 320 } }}
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
              label="Employee"
              value={form.employee}
              onChange={(e) => setForm({ ...form, employee: e.target.value })}
              options={employeeList}
              valueKey="id"
              displayKey={(emp) => `${emp.employee_code} - ${emp.name}`}
              required
              fullWidth
              sx={{ minWidth: { xs: 320 } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <ButtonComponent
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ fontSize: "0.9rem" }}
          >
            Create Order
          </ButtonComponent>
        </Box>
      </form>
    </Box>
  );
};

export default CreateOrder;
