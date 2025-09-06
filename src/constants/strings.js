export const STRINGS = {
  CONFIRM_DELETE_USER_TITLE: "Delete User",
  CONFIRM_DELETE_USER_CONTENT: (name) =>
    `Are you sure you want to delete user "${name}"?`,
  CONFIRM_DELETE_USER_DESCRIPTION: "This action cannot be undone.",

  CONFIRM_DISABLE_USER_TITLE: "Disable User",
  CONFIRM_DISABLE_USER_CONTENT: (name) =>
    `Are you sure you want to disable user "${name}"?`,
  CONFIRM_DISABLE_USER_DESCRIPTION: "You can re-enable this user later.",
  CONFIRM_ENABLE_USER_TITLE: "Enable User",
  CONFIRM_ENABLE_USER_CONTENT: (name) =>
    `Are you sure you want to enable user "${name}"?`,

  CONFIRM: "Confirm",
  CONFIRM_ACTION: "Confirm Action",
  CONFIRM_GENERIC_TITLE: "Are you sure?",
  CONFIRM_GENERIC_CONTENT: "Do you want to proceed?",
  CONFIRM_GENERIC_DESCRIPTION: "",

  SAVE_CHANGES: "Save Changes",
  EDIT: "Edit",
  SUCCESS: "Success",
  ERROR: "Error",
  YES: "Yes",
  NO: "No",
  CANCEL: "Cancel",
  DELETE: "Delete",
  ENABLE: "Enable",
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

  FAILED_TO_LOAD: "Failed to load data",
  FAILED_TO_UPDATE: "Failed to update",
  FAILED_TO_COMPLETE_ACTION: "Failed to complete the action",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again later.",

  FORGOT_PASSWORD_TITLE: "Forgot Password",
  FORGOT_PASSWORD_DESCRIPTION:
    "Enter your email address and we'll send you an OTP to reset your password.",
  VERIFY_OTP_TITLE: "Verify OTP",
  VERIFY_OTP_DESCRIPTION: "Enter the OTP sent to your email.",
  RESET_PASSWORD_TITLE: "Reset Password",
  RESET_PASSWORD_DESCRIPTION: "Create a new password for your account.",

  //All Employees
  DELETE_EMPLOYEE_CONFIRMATION:
    "Are you sure you want to delete this employee ?",
  DISABLE_EMPLOYEE_CONFIRMATION:
    "Are you sure you want to disable this employee ?",
  ENABLE_EMPLOYEE_CONFIRMATION:
    "Are you sure you want to enable this employee ?",

  //Designations
  DISABLE_DESIGNATION: "Are you sure you want to disable this designation ?",
  ENABLE_DESIGNATION: "Are you sure you want to enable this designation ?",

  //Add Stock
  SUBMIT_CONFIRMATION: "Are you sure you want to submit ?",

  //Items
  DISABLE_ITEM_CONFIRMATION: (name) =>
    `Are you sure you want to disable the item "${name}"?`,
  ENABLE_ITEM_CONFIRMATION: (name) =>
    `Are you sure you want to enable the item "${name}"?`,

  //Developer Tools
  WHATSAPP_TEST_MESSAGE: "This is a test message from TBMS",
}; 