export const STRINGS = {
  CONFIRM_DELETE_USER_TITLE: "Delete User",
  CONFIRM_DELETE_USER_CONTENT: (name) =>
    `Are you sure you want to delete user "${name}"?`,
  CONFIRM_DELETE_USER_DESCRIPTION: "This action cannot be undone.",

  CONFIRM_DISABLE_USER_TITLE: "Disable User",
  CONFIRM_DISABLE_USER_CONTENT: (name) =>
    `Are you sure you want to disable user "${name}"?`,
  CONFIRM_DISABLE_USER_DESCRIPTION: "You can re-enable this user later.",

  CONFIRM_GENERIC_TITLE: "Are you sure?",
  CONFIRM_GENERIC_CONTENT: "Do you want to proceed?",
  CONFIRM_GENERIC_DESCRIPTION: "",

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
};
