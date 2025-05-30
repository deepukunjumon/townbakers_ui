import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { Email as EmailIcon, Phone as PhoneIcon } from "@mui/icons-material";
import axios from "axios";
import Loader from "../components/Loader";
import SnackbarAlert from "../components/SnackbarAlert";
import apiConfig from "../config/apiConfig";
import { getToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import ModalComponent from "../components/ModalComponent";
import { ROUTES } from "../constants/routes";
import TextFieldComponent from "../components/TextFieldComponent";
import { STRINGS } from "../constants/strings";

const ViewProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({
    open: false,
    severity: "error",
    message: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    name: "",
  });
  const [initialFormData, setInitialFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    address: "",
    name: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
    address: "",
    name: "",
  });
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const response = await axios.get(`${apiConfig.PROFILE}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setProfile(response.data.user_details);
          setSnack({
            open: true,
            severity: "success",
            message: response.data.message,
          });
        } else {
          throw new Error("Failed to fetch profile");
        }
      } catch (error) {
        setSnack({
          open: true,
          severity: "error",
          message: error.response?.data?.message || "Failed to fetch profile",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (modalOpen && profile) {
      const initData = {
        username: profile.username || "",
        email: profile.email || "",
        mobile: profile.mobile || "",
        address: profile.role === "Branch" ? profile.branch?.address || "" : "",
        name: profile.name || "",
      };
      setFormData(initData);
      setInitialFormData(initData);
      setErrors({ email: "", mobile: "", address: "", name: "" });
    }
  }, [modalOpen, profile]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={6}>
        <Loader />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Typography color="error" variant="h6" align="center" my={6}>
        Failed to load profile details. Please try again later.
      </Typography>
    );
  }

  const roleChipLabel = profile.role || "User";

  const address =
    profile.role === "Branch"
      ? profile.branch?.address || "Address not provided"
      : null;

  const validate = () => {
    let tempErrors = { email: "", mobile: "", address: "", name: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email.trim())
    ) {
      tempErrors.email = "Invalid email format";
      isValid = false;
    }

    if (!formData.mobile.trim()) {
      tempErrors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!/^\d{7,15}$/.test(formData.mobile.trim())) {
      tempErrors.mobile = "Invalid mobile number";
      isValid = false;
    }

    if (profile.role === "Branch") {
      if (!formData.address.trim()) {
        tempErrors.address = "Address is required";
        isValid = false;
      }
      if (!formData.name.trim()) {
        tempErrors.name = "Branch name is required";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const isFormChanged = () => {
    return (
      formData.name !== initialFormData.name ||
      formData.email !== initialFormData.email ||
      formData.mobile !== initialFormData.mobile ||
      (profile.role === "Branch" &&
        (formData.address !== initialFormData.address ||
          formData.name !== initialFormData.name))
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
    setErrors((errs) => ({ ...errs, [name]: "" }));
  };

  const handleUpdate = async () => {
    if (!validate()) return;

    setUpdating(true);
    try {
      const token = getToken();
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      };
      if (profile.role === "Branch") {
        payload.branch = {
          address: formData.address,
          name: formData.name,
        };
      }
      const response = await axios.post(
        `${apiConfig.BASE_URL}/update/profile`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setSnack({
          open: true,
          severity: "success",
          message: response.data.message || STRINGS.SUCCESS,
        });
        setModalOpen(false);
        setProfile((p) => {
          const updated = {
            ...p,
            email: formData.email,
            mobile: formData.mobile,
            name: formData.name,
          };
          if (p.role === "Branch") {
            updated.branch = {
              ...p.branch,
              address: formData.address,
              name: formData.name,
            };
          }
          return updated;
        });
      } else {
        throw new Error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.response?.data?.message || error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box sx={{ maxWidth: "auto", mx: "auto", p: 2 }}>
      <SnackbarAlert
        open={snack.open}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        severity={snack.severity}
        message={snack.message}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: "primary.main",
            fontSize: 36,
            fontWeight: "bold",
          }}
          aria-label="profile-avatar"
        >
          {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold" noWrap>
            {profile.name}
          </Typography>
          <Chip
            label={roleChipLabel}
            color="primary"
            size="small"
            sx={{ py: 1, mt: 1, pointerEvents: "none" }}
          />
        </Box>
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          {profile.role === "Branch" ? "Branch Address" : null}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line" }}
        >
          {address}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        Contact Information
      </Typography>
      <List disablePadding>
        <ListItem disableGutters sx={{ py: 0.8 }}>
          <ListItemIcon sx={{ minWidth: 50, color: "text.secondary" }}>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText
            primary={profile.email || "Not provided"}
            secondaryTypographyProps={{ fontSize: 14 }}
          />
        </ListItem>
        <ListItem disableGutters sx={{ py: 0.8 }}>
          <ListItemIcon sx={{ minWidth: 50, color: "text.secondary" }}>
            <PhoneIcon />
          </ListItemIcon>
          <ListItemText
            primary={profile.mobile || "Not provided"}
            secondaryTypographyProps={{ fontSize: 14 }}
          />
        </ListItem>
      </List>
      <Stack direction="row" spacing={2} mt={4}>
        <Button variant="outlined" onClick={() => setModalOpen(true)}>
          Edit
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate(ROUTES.RESET_PASSWORD)}
        >
          Reset Password
        </Button>
      </Stack>
      <ModalComponent
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit Profile"
        content={
          <Box display="flex" flexDirection="column" gap={2} p={2}>
            <TextFieldComponent
              label="Username"
              name="username"
              disabled
              value={profile.username}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.username)}
              helperText={errors.username}
            />
            {profile.role === "admin" ||
              (profile.role === "super_admin" && (
                <TextFieldComponent
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  required
                />
              ))}
            {profile.role === "Branch" && (
              <TextFieldComponent
                label="Branch Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name}
                required
              />
            )}
            {profile.role === "Branch" && (
              <TextFieldComponent
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={3}
                maxRows={6}
                error={Boolean(errors.address)}
                helperText={errors.address}
                required
              />
            )}
            <TextFieldComponent
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
            />
            <TextFieldComponent
              label="Mobile"
              name="mobile"
              type="mobile"
              value={formData.mobile}
              onChange={handleChange}
              fullWidth
              error={Boolean(errors.mobile)}
              helperText={errors.mobile}
              required
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                onClick={() => setModalOpen(false)}
                variant="outlined"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                variant="contained"
                disabled={updating || !isFormChanged()}
              >
                {updating ? "Updating..." : "Update"}
              </Button>
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default ViewProfile;
