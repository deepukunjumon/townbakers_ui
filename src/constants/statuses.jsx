export const ORDER_STATUS = {
  DELIVERED: 1,
  PENDING: 0,
  CANCELLED: -1,
};

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.DELIVERED]: {
    label: "Delivered",
    color: "success",
  },
  [ORDER_STATUS.PENDING]: {
    label: "Pending",
    color: "warning",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Cancelled",
    color: "error",
  },
  default: {
    label: "Unknown",
    color: "info",
  },
};

export const ORDER_PAYMENT_STATUS = {
  FULL_PAID: 2,
  ADV_PAID: 1,
  UNPAID: 0,
  REFUNDED: -1,
};

export const ORDER_PAYMENT_STATUS_CONFIG = {
  [ORDER_PAYMENT_STATUS.FULL_PAID]: {
    label: "Full Paid",
    color: "success",
  },
  [ORDER_PAYMENT_STATUS.ADV_PAID]: {
    label: "Advance Paid",
    color: "info",
  },
  [ORDER_PAYMENT_STATUS.UNPAID]: {
    label: "Unpaid",
    color: "error",
  },
  [ORDER_PAYMENT_STATUS.REFUNDED]: {
    label: "Refunded",
    color: "warning",
  },
  default: {
    label: "Unknown",
    color: "info",
  },
};

export const USER_STATUS = {
  ACTIVE: 1,
  DISABLED: 0,
  DELETED: -1,
};

export const userStatusMap = {
  [USER_STATUS.ACTIVE]: { label: "Active", color: "success" },
  [USER_STATUS.DISABLED]: { label: "Disabled", color: "warning" },
  [USER_STATUS.DELETED]: { label: "Deleted", color: "error" },
  default: { label: "Unknown", color: "info" },
};
