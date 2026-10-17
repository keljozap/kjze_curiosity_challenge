import { AppError, NotFoundError, ConflictError, ValidationError } from '../../src/errors/app.error';

describe('Clases de Error Personalizadas', () => {

    test('AppError - debe usar el statusCode 400 por defecto si no se proporciona', () => {
        // Probamos la rama del valor por defecto
        const error = new AppError('Error genérico');
        expect(error.message).toBe('Error genérico');
        expect(error.statusCode).toBe(400);
    });

    test('NotFoundError - debe usar el mensaje por defecto si no se proporciona', () => {
        // Probamos la rama del valor por defecto
        const error = new NotFoundError();
        expect(error.message).toBe('Recurso no encontrado.');
        expect(error.statusCode).toBe(404);
    });

    test('ConflictError - debe instanciarse correctamente con su mensaje y código 409', () => {
        const error = new ConflictError('Conflicto detectado');
        expect(error.message).toBe('Conflicto detectado');
        expect(error.statusCode).toBe(409);
    });

    test('ValidationError - debe instanciarse correctamente con su mensaje y código 400', () => {
        const error = new ValidationError('Validación fallida');
        expect(error.message).toBe('Validación fallida');
        expect(error.statusCode).toBe(400);
    });
});