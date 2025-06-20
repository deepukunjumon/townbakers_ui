export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  RESET_PASSWORD: "/password/reset",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",
  FORGOT_PASSWORD: "/forgot-password",

  ITEMS_LIST: "/items",

  SUPER_ADMIN: {
    ROOT: "/super-admin",
    DASHBOARD: "/super-admin/dashboard",
    DESIGNATIONS: "/super-admin/designations",

    CREATE_USER: "/super-admin/create/user",
    USERS_LIST: "/super-admin/users-list",
    CREATE_BRANCH: "/super-admin/create/branch",
    BRANCH_LIST: "/super-admin/view/branches",

    CREATE_EMPLOYEE: "/super-admin/create/employee",
    EMPLOYEES_LIST: "/super-admin/employees",

    STOCK_SUMMARY: "/super-admin/stocks/summary",

    CREATE_ORDER: "/super-admin/create/order",
    ALL_ORDERS: "/super-admin/orders",

    DEVELOPER_TOOLS: "/super-admin/tools",

    AUDIT_LOGS: "/super-admin/logs/audit-logs",

    EMAIL_LOGS: "/super-admin/logs/email-logs",
  },

  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    DESIGNATIONS: "/admin/designations",

    CREATE_BRANCH: "/admin/create/branch",
    BRANCH_LIST: "/admin/view/branches",

    CREATE_EMPLOYEE: "/admin/create/employee",
    EMPLOYEES_LIST: "/admin/employees",

    STOCK_SUMMARY: "/admin/stocks/summary",

    CREATE_ORDER: "/admin/create/order",
    ALL_ORDERS: "/admin/orders",

    EMAIL_LOGS: "/admin/logs/email-logs",
  },

  BRANCH: {
    ROOT: "/branch",
    DASHBOARD: "/branch/dashboard",

    CREATE_EMPLOYEE: "/branch/employee/create",

    ADD_STOCK: "/branch/stock/add",
    VIEW_STOCKS: "/branch/stocks/view",
    LIST_EMPLOYEES: "/branch/employees",
    CREATE_ORDER: "/branch/create/order",
    LIST_ORDERS: "/branch/orders",
  },

  NOT_FOUND: "/not-found",
};
