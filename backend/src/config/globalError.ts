export class AppError extends Error {
    public readonly statusCode: number;
    public readonly isOperational: boolean;
    public readonly errorCode?: string;

    constructor(
        message: string,
        statusCode: number,
        errorCode?: string,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational; // true for expected errors, false for bugs

        Error.captureStackTrace(this, this.constructor);
    }
}
