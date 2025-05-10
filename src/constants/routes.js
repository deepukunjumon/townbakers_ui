export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
  PROFILE: "/profile",

  ADMIN: {
    ROOT: "/admin",
    DASHBOARD: "/admin/dashboard",
    CREATE_EMPLOYEE: "/admin/create/employee",
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
  },
};
