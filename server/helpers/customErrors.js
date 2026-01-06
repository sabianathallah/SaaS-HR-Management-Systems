/**
 * Custom Error Classes untuk standardisasi error handling
 * Gunakan error classes ini untuk konsistensi di seluruh aplikasi
 */

class BadRequestError extends Error {
    constructor(message = 'Bad Request') {
        super(message);
        this.name = 'BadRequest';
        this.statusCode = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'Unauthorized';
        this.statusCode = 401;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'Forbidden';
        this.statusCode = 403;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends Error {
    constructor(message = 'Data not found') {
        super(message);
        this.name = 'NotFound';
        this.statusCode = 404;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ConflictError extends Error {
    constructor(message = 'Conflict') {
        super(message);
        this.name = 'Conflict';
        this.statusCode = 409;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends Error {
    constructor(message = 'Validation Error') {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        Error.captureStackTrace(this, this.constructor);
    }
}

class LoginError extends Error {
    constructor(message = 'Invalid email or password') {
        super(message);
        this.name = 'LoginError';
        this.statusCode = 401;
        Error.captureStackTrace(this, this.constructor);
    }
}

class TokenExpiredError extends Error {
    constructor(message = 'Token has expired, please login again') {
        super(message);
        this.name = 'TokenExpiredError';
        this.statusCode = 401;
        Error.captureStackTrace(this, this.constructor);
    }
}

class GoogleAuthError extends Error {
    constructor(message = 'Invalid or expired Google token') {
        super(message);
        this.name = 'GoogleAuthError';
        this.statusCode = 401;
        Error.captureStackTrace(this, this.constructor);
    }
}

class PayloadTooLargeError extends Error {
    constructor(message = 'Request body is too large') {
        super(message);
        this.name = 'PayloadTooLargeError';
        this.statusCode = 413;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    LoginError,
    TokenExpiredError,
    GoogleAuthError,
    PayloadTooLargeError
};
