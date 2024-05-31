function createCustomError(status, message) {
    const error = new Error(message);
    error.status = status;
    error.name = "CustomError";
    return error;
}

function BadRequestError(message = "Bad Request") {
    return createCustomError(400, message);
}

function NotFoundError(message = "Not Found") {
    return createCustomError(404, message);
}

function UnauthorizedError(message = "Unauthorized") {
    return createCustomError(401, message);
}

function ForbiddenError(message = "Forbidden") {
    return createCustomError(403, message);
}

export { BadRequestError, NotFoundError, UnauthorizedError, ForbiddenError };
