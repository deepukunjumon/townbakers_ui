const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api-tbms.up.railway.app/api" //Production URL
    : "http://localhost:8000/api"; //Development URL

const apiConfig = {
  BASE_URL: API_BASE_URL,

  // Common APIs
  LOGIN_URL: `${API_BASE_URL}/login`,
  RESET_PASSWORD_URL: `${API_BASE_URL}/password/reset`,
  PROFILE: `${API_BASE_URL}/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/update/profile`,
  LOGOUT_URL: `${API_BASE_URL}/logout`,
  MINIMAL_BRANCHES: `${API_BASE_URL}/branches/minimal`,
  MINIMAL_EMPLOYEES: `${API_BASE_URL}/employees/minimal`,
  DESIGNATIONS: `${API_BASE_URL}/designations`,
  ACTIVE_DESIGNATIONS: `${API_BASE_URL}/designations/active`,

  EMPLOYEE_DETAILS: (id) => `${API_BASE_URL}/employee/${id}`,
  UPDATE_EMPLOYEE_DETAILS: (id) => `${API_BASE_URL}/employee/update/${id}`,
  UPDATE_EMPLOYEE_STATUS: `${API_BASE_URL}/employee/update-status`,

  CREATE_ITEM: `${API_BASE_URL}/create/item`,
  UPDATE_ITEM_DETAILS: (id) => `${API_BASE_URL}/item/update/${id}`,
  IMPORT_ITEMS: `${API_BASE_URL}/import/items`,
  ITEMS_LIST: `${API_BASE_URL}/items`,
  MINIMAL_ITEMS: `${API_BASE_URL}/items/minimal`,
  UPDATE_ITEM_STATUS: `${API_BASE_URL}/item/update-status`,

  ORDER_DETAILS: (id) => `${API_BASE_URL}/order/${id}`,

  CREATE_DESIGNATION: `${API_BASE_URL}/create/designation`,
  UPDATE_DESIGNATION_DETAILS: (id) => `${API_BASE_URL}/designation/update/${id}`,
  UPDATE_DESIGNATION_STATUS: `${API_BASE_URL}/designation/update-status`,

  //Sample Files
  SAMPLE_EMPLOYEES_IMPORT: `${API_BASE_URL}/../sample-files/employees.xlsx`,

  //Super Admin APIs
  SUPER_ADMIN: {
    DASHBOARD_STATS: `${API_BASE_URL}/super-admin/dashboard/stats`,
    CREATE_USER: `${API_BASE_URL}/super-admin/create/user`,
    USER_ROLES: `${API_BASE_URL}/super-admin/user-roles`,
    USERS_LIST: `${API_BASE_URL}/super-admin/users`,
    UPDATE_USER_STATUS: `${API_BASE_URL}/super-admin/user/update-status`,
    UPDATE_USER_DETAILS: (id) => `${API_BASE_URL}/super-admin/user/update/${id}`,
    MAIL_TEST: `${API_BASE_URL}/super-admin/test-mail`,
    AUDIT_LOGS: `${API_BASE_URL}/super-admin/logs/audit-logs`,
    AUDIT_LOG_ACTIONS: `${API_BASE_URL}/super-admin/audit-log/actions`,
    TABLES_LIST: `${API_BASE_URL}/super-admin/list/tables`,
    EMAIL_LOGS: `${API_BASE_URL}/admin/logs/email-logs`,
    EMAIL_LOG_TYPES: `${API_BASE_URL}/admin/email-log/types`,
  },

  // Admin APIs
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/admin/dashboard/stats`,
  CREATE_BRANCH: `${API_BASE_URL}/admin/create/branch`,
  BRANCH_LIST: `${API_BASE_URL}/admin/branches`,
  BRANCH_DETAILS: `${API_BASE_URL}/admin/branch/{id}`,
  UPDATE_BRANCH_DETAILS: (id) => `${API_BASE_URL}/admin/branch/update/${id}`,

  ALL_EMPLOYEES_LIST: `${API_BASE_URL}/admin/all-employees`,
  CREATE_EMPLOYEE: `${API_BASE_URL}/admin/create/employee`,
  EXPORT_ALL_EMPLOYEES: `${API_BASE_URL}/admin/employees/export`,
  IMPORT_EMPLOYEES: `${API_BASE_URL}/admin/import/employees`,

  BRANCHWISE_STOCK_SUMMARY: `${API_BASE_URL}/admin/branchwise/stock/summary`,

  ADMIN_CREATE_ORDER: `${API_BASE_URL}/admin/create/order`,
  ALL_ORDERS: `${API_BASE_URL}/admin/orders`,

  USERS_COUNTS: `${API_BASE_URL}/admin/users/status/counts`,
  USERS_LIST: `${API_BASE_URL}/admin/users`,
  ADD_USER: `${API_BASE_URL}/admin/add/user`,
  DELETE_USER: (id) => `${API_BASE_URL}/admin/delete/user/${id}`,
  GET_USER_DETAILS: (id) => `${API_BASE_URL}/admin/get/user/${id}`,
  UPDATE_USER_DETAILS: (id) => `${API_BASE_URL}/admin/update/user/${id}`,

  // Branch APIs
  BRANCH_DASHBOARD_STATS: `${API_BASE_URL}/branch/dashboard/stats`,

  CREATE_BRANCH_EMPLOYEE: `${API_BASE_URL}/branch/create/employee`,
  BRANCH_EMPLOYEES: `${API_BASE_URL}/branch/employees`,

  CREATE_ORDER: `${API_BASE_URL}/branch/create/order`,
  BRANCH_ORDERS: `${API_BASE_URL}/branch/orders`,
  UPDATE_ORDER_STATUS: (id) => `${API_BASE_URL}/order/${id}/status`,

  ADD_STOCK: `${API_BASE_URL}/stock/add`,
  STOCK_SUMMARY: `${API_BASE_URL}/branch/stock/summary`,
};

export default apiConfig;
