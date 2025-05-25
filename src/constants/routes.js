export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  RESET_PASSWORD: "/password/reset",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",

  ITEMS_LIST: "/items",

  SUPER_ADMIN: {
    ROOT: "/super-admin",
    DASHBOARD: "/super-admin/dashboard",
    DESIGNATIONS: "/super-admin/designations",

    CREATE_USER: "/super-admin/create/user",
    CREATE_BRANCH: "/super-admin/create/branch",
    BRANCH_LIST: "/super-admin/view/branches",

    CREATE_EMPLOYEE: "/super-admin/create/employee",
    EMPLOYEES_LIST: "/super-admin/employees",

    STOCK_SUMMARY: "/super-admin/stocks/summary",

    DEVELOPER_TOOLS: "/super-admin/tools",
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
