class ApiResponse {

    constructor(statusCode, message, data = null) {

        this.success = true;

        this.statusCode = statusCode;

        this.message = message;

        this.data = data;

    }

}

class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);

        this.success = false;
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
    }
}

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise
            .resolve(fn(req, res, next))
            .catch((error) => next(error))
    }
}

module.exports = { ApiResponse, ApiError, asyncHandler };



