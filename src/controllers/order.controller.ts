// src/controllers/order.controller.ts
import { Request, Response, NextFunction } from "express";
import { orderService } from "../services/order.service.js";

export const createOrder = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const { cliente, productos } = req.body;
        const newOrder = orderService.createOrder(cliente, productos);
        res.status(201).json(newOrder);
    } catch (error: unknown) {
        next(error);
    }
};

export const getOrderById = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const id = req.params.id as string;
        const order = orderService.getOrderById(id);
        res.status(200).json(order);
    } catch (error: unknown) {
        next(error);
    }
};

export const getAllOrders = (req: Request, res: Response): void => {
    const orders = orderService.getAllOrders();
    res.status(200).json(orders);
};

export const updateOrderStatus = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const id = req.params.id as string;
        const { estado } = req.body;
        const order = orderService.updateOrderStatus(id, estado);
        res.status(200).json(order);
    } catch (error: unknown) {
        next(error);
    }
};

export const cancelOrder = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const id = req.params.id as string;
        const cancellationOrder = orderService.cancelOrder(id);
        res.status(200).json(cancellationOrder);
    } catch (error: unknown) {
        next(error);
    }
};