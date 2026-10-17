// src/index.ts
import express, { Application } from 'express';
import apiRouter from './routes/index.js';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());

// Punto de entrada centralizado
app.use('/api', apiRouter);

// Iniciar el servidor solo si no estamos en entorno de pruebas
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor de Orders API ejecutándose en http://localhost:${PORT}`);
    });
}

export default app; // Lo exportamos para usarlo en las pruebas de Jest
