const API_MESSAGE = Object.freeze({
    CREATED: "Created successfully.",
    UPDATED: "Updated successfully.",
    DELETED: "Deleted successfully.",
    FETCHED: "Data fetched successfully.",

    LOGIN_SUCCESS: "Login successfully.",
    LOGOUT_SUCCESS: "Logout successfully.",

    INVALID_CREDENTIALS: "Invalid email & password.",

    UNAUTHORIZED: "Unauthorized access.",
    TOKEN_NOT_FOUND: "Token not found",
    FORBIDDEN: "Permission denied.",
    NOT_FOUND: "Resource not found.",

    VALIDATION_ERROR: "Validation failed.",
    SERVER_ERROR: "Internal server error."
});

module.exports = { API_MESSAGE };