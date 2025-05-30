import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import SnackbarAlert from "../../components/SnackbarAlert";
import TextFieldComponent from "../../components/TextFieldComponent";
import SelectFieldComponent from "../../components/SelectFieldComponent";
import ModalComponent from "../../components/ModalComponent";
import ImportMenuComponent from "../../components/ImportMenuComponent";
import axios from "axios";
import apiConfig from "../../config/apiConfig";
import { getToken } from "../../utils/auth";
import Loader from "../../components/Loader";

const CreateEmployee = () => {
  const [form, setForm] = useState({
    employee_code: "",
    name: "",
    mobile: "",
    designation_id: "",
    branch_id: "",
  });

  const [branches, setBranches] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [snack, setSnack] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${apiConfig.MINIMAL_BRANCHES}`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setBranches(data.branches || []);
        else throw new Error();
      } catch {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to fetch branches",
        });
      }
    };

    const fetchDesignations = async () => {
      try {
        const res = await fetch(`${apiConfig.DESIGNATIONS}`, {
          headers: { Authorization: getToken() },
        });
        const data = await res.json();
        if (res.ok) setDesignations(data.designations || []);
        else throw new Error();
      } catch {
        setSnack({
          open: true,
          severity: "error",
          message: "Failed to fetch designations",
        });
      }
    };

    fetchBranches();
    fetchDesignations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        designation_id:
          typeof form.designation_id === "object" &&
            form.designation_id !== null
            ? form.designation_id.id
            : form.designation_id,
        branch_id:
          typeof form.branch_id === "object" && form.branch_id !== null
            ? form.branch_id.id
            : form.branch_id,
      };
      const res = await fetch(`${apiConfig.CREATE_EMPLOYEE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSnack({
        open: true,
        severity: res.ok ? "success" : "error",
        message: data.message || "Error creating employee",
      });

      if (res.ok) {
        setForm({
          employee_code: "",
          name: "",
          mobile: "",
          designation_id: "",
          branch_id: "",
        });
      }
    } catch {
      setSnack({
        open: true,
        severity: "error",
        message: "Error submitting form",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportClick = () => setImportModalOpen(true);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${apiConfig.IMPORT_EMPLOYEES}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getToken()}`,
        },
      });
      setImportResult(res.data);
    } catch {
      setImportResult({ success: false, message: "Import failed." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      {loading && <Loader message="Creating employee..." />}
      <ModalComponent
        open={importModalOpen}
        onClose={() => {
          setImportModalOpen(false);
          setFile(null);
          setImportResult(null);
        }}
        title="Import Employees"
        content={
          <Box>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              disabled={importing}
            />
            <Button
              onClick={handleImport}
              disabled={!file || importing}
              sx={{ mt: 2 }}
              variant="contained"
            >
              {importing ? "Importing..." : "Import"}
            </Button>
            <Box sx={{ mb: 2 }}>
              <a
                href={`${apiConfig.SAMPLE_EMPLOYEES_IMPORT}`}
                download
                style={{ textDecoration: "underline", color: "#1976d2" }}
                rel="noopener noreferrer"
              >
                Sample File
              </a>
            </Box>
            {importResult && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  color={importResult.success ? "success.main" : "error.main"}
                >
                  {importResult.message}
                </Typography>
                {importResult.errors && importResult.errors.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2">Errors:</Typography>
                    <ul>
                      {importResult.errors.map((err, idx) => (
                        <li key={idx}>
                          Row {err.row}: {Object.values(err.errors).join(", ")}
                        </li>
                      ))}
                    </ul>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        }
      />

      <Box sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
        <SnackbarAlert
          open={snack.open}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          message={snack.message}
        />

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>
            Create Employee
          </Typography>
          <ImportMenuComponent onImportClick={handleImportClick} />
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleSubmit}>
          <TextFieldComponent
            name="employee_code"
            label="Employee Code"
            value={form.employee_code}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextFieldComponent
            name="name"
            label="Name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextFieldComponent
            name="mobile"
            type="mobile"
            label="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <SelectFieldComponent
            label="Designation"
            name="designation_id"
            value={form.designation_id}
            onChange={(e) =>
              setForm({ ...form, designation_id: e.target.value })
            }
            options={designations}
            valueKey="id"
            displayKey={(des) => des.designation}
            required
            fullWidth
          />
          <SelectFieldComponent
            label="Branch"
            name="branch_id"
            value={form.branch_id}
            onChange={(e) => setForm({ ...form, branch_id: e.target.value })}
            options={branches}
            valueKey="id"
            displayKey={(branch) => `${branch.code} - ${branch.name}`}
            required
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Employee"}
          </Button>
        </form>
      </Box>
    </>
  );
};

export default CreateEmployee;
