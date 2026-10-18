// src/index.ts
import express, { Application } from 'express';
import apiRouter from './routes/index';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';
import cors from 'cors';

const app: Application = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares globales (Deben ir primero)
app.use(cors()); // <-- CORS arriba, antes que las rutas
app.use(express.json());

// Routes
app.use(apiRouter);  // Serves /orders directly as required by the challenge
app.use('/api', apiRouter);  // Optional: also serves /api/orders

// 1. Catch 404s (must be right after routes)
app.use(notFoundHandler);

// 2. Global error handler (must be the very LAST middleware with 4 arguments)
app.use(errorHandler);

// Solo iniciar el servidor si NO estamos en un entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
    });
}

export default app;