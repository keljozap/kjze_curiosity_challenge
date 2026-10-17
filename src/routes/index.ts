// Centralizar el ruteo en caso de que la aplicación crezca creando este archivo como router central
import { Router } from 'express';
import orderRoutes from './order.routes';

const apiRouter = Router();

apiRouter.use('/orders', orderRoutes);

export default apiRouter;
