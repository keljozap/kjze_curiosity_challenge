import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../models/order.model.js';
import { Product } from '../models/product.model.js';

export class OrderService {
    // DB for the challenge
    private orders: Order[] = [];

    createOrder(cliente: string, productos: Product[]): Order {

        // RN-01: Una orden debe contener al menos un producto
        if (!productos || productos.length === 0) {
            throw new Error('RN-01: La orden debe contener al menos un producto.');
        }

        // RN-02: La cantidad de cada producto debe ser mayor que cero
        const hasInvalidQuantity = productos.some(p => p.cantidad <= 0);
        if (hasInvalidQuantity) {
            throw new Error('RN-02: La cantidad de cada producto debe ser mayor que cero.');
        }

        // RN-03: El valor total de la orden debe calcularse automáticamente
        const total = productos.reduce((acc, p) => acc + (p.cantidad * p.valorUnitario), 0);

        const newOrder: Order = {
            id: uuidv4(),
            cliente,
            productos,
            total,
            estado: OrderStatus.CREADA
        };

        this.orders.push(newOrder);
        return newOrder;
    }

    getOrderById(id: string): Order {
        const order = this.orders.find(o => o.id === id);
        if (!order) {
            throw new Error('Orden no encontrada.');
        }
        return order;
    }

    getAllOrders(): Order[] {
        return this.orders;
    }

    updateOrderStatus(id: string, nuevoEstado: OrderStatus): Order {
        const order = this.getOrderById(id);

        // RN-06: No se deben permitir transiciones inválidas de estado
        const validTransitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.CREADA]: [OrderStatus.PAGADA, OrderStatus.CANCELADA],
            [OrderStatus.PAGADA]: [OrderStatus.ENVIADA, OrderStatus.CANCELADA],
            [OrderStatus.ENVIADA]: [OrderStatus.ENTREGADA, OrderStatus.CANCELADA],
            [OrderStatus.ENTREGADA]: [],
            [OrderStatus.CANCELADA]: []
        };

        if (!validTransitions[order.estado].includes(nuevoEstado)) {
            // RN-05: Una orden no puede ser enviada si no ha sido pagada
            if (nuevoEstado === OrderStatus.ENVIADA && order.estado !== OrderStatus.PAGADA) {
                throw new Error('RN-05: Una orden no puede ser enviada si no ha sido pagada.');
            }
            throw new Error(`RN-06: Transición inválida de ${order.estado} a ${nuevoEstado}.`);
        }

        order.estado = nuevoEstado;
        return order;
    }

    cancelOrder(id: string): Order {
        const order = this.getOrderById(id);

        // RN-04: Una orden entregada no puede ser cancelada
        if (order.estado === OrderStatus.ENTREGADA) {
            throw new Error('RN-04: Una orden entregada no puede ser cancelada.');
        }

        return this.updateOrderStatus(id, OrderStatus.CANCELADA);
    }
}

// Export one single instance
export const orderService = new OrderService();