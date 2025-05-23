const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-tbms.up.railway.app/api" //Production URL
    : "http://172.25.9.134:8000/api"; //Development URL

const apiConfig = {
  BASE_URL: API_BASE_URL,

  // Common APIs
  LOGIN_URL: `${API_BASE_URL}/login`,
  RESET_PASSWORD_URL: `${API_BASE_URL}/password/reset`,
  PROFILE: `${API_BASE_URL}/profile`,
  LOGOUT_URL: `${API_BASE_URL}/logout`,
  MINIMAL_BRANCHES: `${API_BASE_URL}/branches/minimal`,
  DESIGNATIONS: `${API_BASE_URL}/designations`,
  ACTIVE_DESIGNATIONS: `${API_BASE_URL}/designations/active`,

  UPDATE_EMPLOYEE_STATUS: `${API_BASE_URL}/employee/update-status`,

  CREATE_ITEM: `${API_BASE_URL}/create/item`,
  ITEMS_LIST: `${API_BASE_URL}/items`,
  MINIMAL_ITEMS: `${API_BASE_URL}/items/minimal`,
  UPDATE_ITEM_STATUS: `${API_BASE_URL}/item/update-status`,

  CREATE_DESIGNATION: `${API_BASE_URL}/create/designation`,
  UPDATE_DESIGNATION_STATUS: `${API_BASE_URL}/designation/update-status`,

  //Super Admin APIs
  CREATE_USER: `${API_BASE_URL}/super-admin/create/user`,

  // Admin APIs
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
  CREATE_BRANCH: `${API_BASE_URL}/admin/create/branch`,
  BRANCH_LIST: `${API_BASE_URL}/admin/branches`,
  BRANCH_DETAILS: `${API_BASE_URL}/admin/branch/{id}`,

  ALL_EMPLOYEES_LIST: `${API_BASE_URL}/admin/all-employees`,
  CREATE_EMPLOYEE: `${API_BASE_URL}/admin/create/employee`,
  EXPORT_ALL_EMPLOYEES: `${API_BASE_URL}/admin/employees/export`,
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
