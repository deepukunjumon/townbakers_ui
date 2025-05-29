export const STRINGS = {
  CONFIRM_DELETE_USER_TITLE: "Delete User",
  CONFIRM_DELETE_USER_CONTENT: (name) =>
    `Are you sure you want to delete user "${name}"?`,
  CONFIRM_DELETE_USER_DESCRIPTION: "This action cannot be undone.",

  CONFIRM_DISABLE_USER_TITLE: "Disable User",
  CONFIRM_DISABLE_USER_CONTENT: (name) =>
    `Are you sure you want to disable user "${name}"?`,
  CONFIRM_DISABLE_USER_DESCRIPTION: "You can re-enable this user later.",

  CONFIRM: "Confirm",
  CONFIRM_ACTION: "Confirm Action",
  CONFIRM_GENERIC_TITLE: "Are you sure?",
  CONFIRM_GENERIC_CONTENT: "Do you want to proceed?",
  CONFIRM_GENERIC_DESCRIPTION: "",

  SUCCESS: "Success",
  ERROR: "Error",
  YES: "Yes",
  NO: "No",
  CANCEL: "Cancel",
  DELETE: "Delete",
  DISABLE: "Disable",
  OK: "OK",

  LIKE: "Like",
  UNLIKE: "Unlike",
  LIKES: "Likes",
  LIKED: "Liked",
  NOT_LIKED: "Not Liked",
  YOU_AND_OTHERS: (count) => `You and ${count} others`,
  TOTAL_LIKES: (count) => `${count} Like${count === 1 ? "" : "s"}`,

  LOGIN_SUCCESS: "Login successful",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",

  //All Employees
  DISABLE_EMPLOYEE_CONFIRMATION:
    "Are you sure you want to disable this employee ?",
  ENABLE_EMPLOYEE_CONFIRMATION:
    "Are you sure you want to enable this employee ?",

  //Designations
  DISABLE_DESIGNATION: "Are you sure you want to disable this designation ?",
  ENABLE_DESIGNATION: "Are you sure you want to enable this designation ?",

  //Add Stock
  SUBMIT_CONFIRMATION: "Are you sure you want to submit ?",
};
