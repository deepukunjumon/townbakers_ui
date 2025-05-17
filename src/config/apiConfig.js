const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "https://52.204.98.211/api"
    : "https://52.204.98.211/api";

const apiConfig = {
  BASE_URL: API_BASE_URL,

  // Common APIs
  LOGIN_URL: `${API_BASE_URL}/login`,
  RESET_PASSWORD_URL: `${API_BASE_URL}/password/reset`,
  PROFILE: `${API_BASE_URL}/profile`,
  LOGOUT_URL: `${API_BASE_URL}/logout`,
  MINIMAL_BRANCHES: `${API_BASE_URL}/branches/minimal`,

  // Admin APIs
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
  CREATE_BRANCH: `${API_BASE_URL}/admin/create/branch`,
  BRANCH_LIST: `${API_BASE_URL}/admin/branches`,

  ALL_EMPLOYEES_LIST: `${API_BASE_URL}/admin/all-employees`,
  CREATE_EMPLOYEE: `${API_BASE_URL}/admin/create/employee`,
  IMPORT_EMPLOYEES: `${API_BASE_URL}/admin/import/employees`,

  BRANCHWISE_STOCK_SUMMARY: `${API_BASE_URL}/admin/branchwise/stock/summary`,

  USERS_COUNTS: `${API_BASE_URL}/admin/users/status/counts`,
  USERS_LIST: `${API_BASE_URL}/admin/users`,
  ADD_USER: `${API_BASE_URL}/admin/add/user`,
  DELETE_USER: (id) => `${API_BASE_URL}/admin/delete/user/${id}`,
  GET_USER_DETAILS: (id) => `${API_BASE_URL}/admin/get/user/${id}`,
  UPDATE_USER_DETAILS: (id) => `${API_BASE_URL}/admin/update/user/${id}`,

  // Branch APIs
  BRANCH_DASHBOARD_STATS: `${API_BASE_URL}/branch/dashboard/stats`,
  STOCK_SUMMARY: `${API_BASE_URL}/branch/stock/summary`,
};

export default apiConfig;
