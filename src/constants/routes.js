export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  RESET_PASSWORD: "/password/reset",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",

  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",

    CREATE_BRANCH: "/admin/create/branch",
    BRANCH_LIST: "/admin/view/branches",

    CREATE_EMPLOYEE: "/admin/create/employee",
    EMPLOYEE_LIST: "/admin/employees",

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
