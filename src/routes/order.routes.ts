// src/routes/order.routes.ts
import { Router } from 'express';
import {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.controller';

const router = Router();

// Crear orden
router.post('/', createOrder);
//Listar órdenes
router.get('/', getAllOrders);
//Consultar orden por ID
router.get('/:id', getOrderById);
//Actualizar estado de la orden
router.patch('/:id/status', updateOrderStatus);
//Cancelar orden
router.delete('/:id', cancelOrder);

export default router;