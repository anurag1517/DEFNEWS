import { Request, Response, NextFunction } from 'express';
import { AppError } from '../config/globalError';
export const globalErrorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            code: err.errorCode,
            message: err.message,
        })
    }

    console.error('CRITICAL ERROR:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
}