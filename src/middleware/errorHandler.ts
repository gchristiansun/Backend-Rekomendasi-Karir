import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { ZodError } from 'zod';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('ERROR: ', err);

    // Handler zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message
            }))
        });
    }

    // Handler custom HttpError
    if (err instanceof HttpError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    // Handler error umum
    return res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
}
