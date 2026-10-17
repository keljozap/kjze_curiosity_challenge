import { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { AppError } from '../errors/app.error.js';

const handleError = (res: Response, error: unknown): void => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
    }
    res.status(500).json({ error: 'Error interno del servidor.' });
};

export const createOrder = (req: Request, res: Response): void => {
    try {
        const { cliente, productos } = req.body;
        const newOrder = orderService.createOrder(cliente, productos);
        res.status(201).json(newOrder);
    } catch (error: unknown) {
        handleError(res, error);
    }
}

export const getOrderById = (req: Request, res: Response): void => {
    try {
        const id = req.params.id as string;
        const order = orderService.getOrderById(id);
        res.status(200).json(order);
    } catch (error: unknown) {
        handleError(res, error);
    }
}

export const getAllOrders = (req: Request, res: Response): void => {
    const orders = orderService.getAllOrders();
    res.status(200).json(orders);
}

export const updateOrderStatus = (req: Request, res: Response): void => {
    try {
        const id = req.params.id as string;
        const { estado } = req.body;
        const order = orderService.updateOrderStatus(id, estado);
        res.status(200).json(order);
    } catch (error: unknown) {
        handleError(res, error);
    }
}

export const cancelOrder = (req: Request, res: Response): void => {
    try {
        const id = req.params.id as string;
        const cancellationOrder = orderService.cancelOrder(id);
        res.status(200).json(cancellationOrder);
    } catch (error: unknown) {
        // Retorna 409 Conflict si se intenta cancelar una orden entregada, como se exige
        handleError(res, error);
    }
}
