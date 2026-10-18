import { Request, Response, NextFunction } from 'express';
import { AppError, NotFoundError } from '../errors/app.error';

/**
 * Intercepts requests that do not match any defined route
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    // We forward a NotFoundError to the centralized errorHandler
    next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`));
};

/**
 * Centralized error handling middleware (must have 4 arguments)
 */
export const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // 1. Controlled domain/application errors (ValidationError, NotFoundError, ConflictError)
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    // 2. Malformed JSON payload sent in body
    if (err instanceof SyntaxError && 'status' in err && err.status === 400) {
        res.status(400).json({ error: 'El cuerpo de la solicitud contiene un JSON inválido.' });
        return;
    }

    // 3. Unexpected server errors
    console.error('Unhandled unexpected error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
};
