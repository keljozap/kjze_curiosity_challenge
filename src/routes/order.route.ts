// src/routes/order.routes.ts
import { Router } from 'express';
import {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
} from '../controllers/order.controller.js';

const router = Router();

// Crear orden
router.post('/orders', createOrder);

// Consultar orden por ID
router.get('/orders/:id', getOrderById);

// Listar órdenes
router.get('/orders', getAllOrders);

// Actualizar estado de la orden
router.patch('/orders/:id/status', updateOrderStatus);

// Cancelar orden
router.delete('/orders/:id', cancelOrder);

export default router;