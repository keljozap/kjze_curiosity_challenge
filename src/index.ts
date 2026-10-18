// src/index.ts
import express, { Application } from 'express';
import apiRouter from './routes/index';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware';

const app: Application = express();
const PORT = Number(process.env.PORT) || 3001;

// Body parsing
app.use(express.json());

// Routes
app.use(apiRouter);  // Serves /orders directly as required by the challenge
app.use('/api', apiRouter);  // Optional: also serves /api/orders

// 1. Catch 404s (must be right after routes)
app.use(notFoundHandler);

// 2. Global error handler (must be the very LAST middleware with 4 arguments)
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    // 0.0.0.0 permite peticiones desde cualquier interfaz de red (incluyendo Docker)
    console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});

export default app;