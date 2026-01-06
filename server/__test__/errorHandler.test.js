/**
 * Test untuk ErrorHandler Middleware
 * Memverifikasi bahwa semua jenis error ditangani dengan benar
 */

const errorHandler = require('../middlewares/errorHandler');
const {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    LoginError
} = require('../helpers/customErrors');

describe('ErrorHandler Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    describe('Sequelize Errors', () => {
        test('should handle SequelizeValidationError', () => {
            const err = {
                name: 'SequelizeValidationError',
                errors: [{ message: 'Validation failed' }]
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Validation failed'
            });
        });

        test('should handle SequelizeUniqueConstraintError', () => {
            const err = {
                name: 'SequelizeUniqueConstraintError',
                errors: [{ message: 'Email must be unique' }]
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Email must be unique'
            });
        });

        test('should handle SequelizeDatabaseError', () => {
            const err = {
                name: 'SequelizeDatabaseError',
                message: 'Database error'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid input'
            });
        });
    });

    describe('Custom Application Errors', () => {
        test('should handle BadRequest error object', () => {
            const err = {
                name: 'BadRequest',
                message: 'Invalid input data'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid input data'
            });
        });

        test('should handle BadRequestError class', () => {
            const err = new BadRequestError('Custom validation error');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Custom validation error'
            });
        });

        test('should handle LoginError object', () => {
            const err = {
                name: 'LoginError'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        test('should handle LoginError class', () => {
            const err = new LoginError();

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid email or password'
            });
        });

        test('should handle NotFound error object', () => {
            const err = {
                name: 'NotFound',
                message: 'User not found'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User not found'
            });
        });

        test('should handle NotFoundError class', () => {
            const err = new NotFoundError('Resource not found');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Resource not found'
            });
        });

        test('should handle Forbidden error', () => {
            const err = {
                name: 'Forbidden',
                message: 'Access denied'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You dont have any access'
            });
        });

        test('should handle ForbiddenError class', () => {
            const err = new ForbiddenError('Admin access required');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'You dont have any access'
            });
        });
    });

    describe('JWT Errors', () => {
        test('should handle JsonWebTokenError', () => {
            const err = {
                name: 'JsonWebTokenError',
                message: 'jwt malformed'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Please login first'
            });
        });

        test('should handle TokenExpiredError', () => {
            const err = {
                name: 'TokenExpiredError',
                message: 'jwt expired'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Token has expired, please login again'
            });
        });

        test('should handle Unauthorized error', () => {
            const err = {
                name: 'Unauthorized',
                message: 'No token provided'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Please login first'
            });
        });

        test('should handle UnauthorizedError class', () => {
            const err = new UnauthorizedError('Token missing');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Please login first'
            });
        });
    });

    describe('Multer Errors', () => {
        test('should handle LIMIT_FILE_SIZE', () => {
            const err = {
                name: 'MulterError',
                code: 'LIMIT_FILE_SIZE'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'File size is too large'
            });
        });

        test('should handle LIMIT_FILE_COUNT', () => {
            const err = {
                name: 'MulterError',
                code: 'LIMIT_FILE_COUNT'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Too many files uploaded'
            });
        });

        test('should handle LIMIT_UNEXPECTED_FILE', () => {
            const err = {
                name: 'MulterError',
                code: 'LIMIT_UNEXPECTED_FILE'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Unexpected field name in file upload'
            });
        });
    });

    describe('Generic Error Objects from Models/Helpers', () => {
        test('should handle "not found" error message', () => {
            const err = new Error('Notification not found');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notification not found'
            });
        });

        test('should handle "required" validation error', () => {
            const err = new Error('Start date and end date are required for custom period');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Start date and end date are required for custom period'
            });
        });

        test('should handle "invalid" validation error', () => {
            const err = new Error('Invalid period type. Use: daily, weekly, monthly, or custom');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid period type. Use: daily, weekly, monthly, or custom'
            });
        });

        test('should handle "must be" validation error', () => {
            const err = new Error('Leave date must be after join date');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Leave date must be after join date'
            });
        });

        test('should handle "cannot" validation error', () => {
            const err = new Error('Cannot delete this resource');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Cannot delete this resource'
            });
        });

        test('should handle "unauthorized" error message', () => {
            const err = new Error('User is unauthorized to perform this action');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User is unauthorized to perform this action'
            });
        });

        test('should handle "forbidden" error message', () => {
            const err = new Error('Access is forbidden for this user');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Access is forbidden for this user'
            });
        });

        test('should handle unknown error as 500 in test env', () => {
            const err = new Error('Some random unexpected error');

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Some random unexpected error'
            });
        });
    });

    describe('Other Errors', () => {
        test('should handle PayloadTooLargeError', () => {
            const err = {
                name: 'PayloadTooLargeError'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(413);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Request body is too large'
            });
        });

        test('should handle entity.too.large', () => {
            const err = {
                type: 'entity.too.large'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(413);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Request body is too large'
            });
        });

        test('should handle GoogleAuthError', () => {
            const err = {
                name: 'GoogleAuthError',
                message: 'Invalid Google token'
            };

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Invalid or expired Google token'
            });
        });

        test('should handle error with custom statusCode', () => {
            const err = new Error('Custom error');
            err.statusCode = 422;

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(422);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Custom error'
            });
        });
    });
});
