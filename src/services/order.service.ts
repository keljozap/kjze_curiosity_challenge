import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors/app.error.js';

export class OrderService {
    // DB for the challenge
    private orders: Order[] = [];

    // RN-06: No se deben permitir transiciones inválidas de estado
    private static readonly VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.CREADA]: [OrderStatus.PAGADA, OrderStatus.CANCELADA],
        [OrderStatus.PAGADA]: [OrderStatus.ENVIADA, OrderStatus.CANCELADA],
        [OrderStatus.ENVIADA]: [OrderStatus.ENTREGADA, OrderStatus.CANCELADA],
        [OrderStatus.ENTREGADA]: [],
        [OrderStatus.CANCELADA]: []
    };

    createOrder(cliente: string, productos: Product[]): Order {
        // RN-00: Validar que el nombre del cliente no sea nulo, vacío o solo espacios en blanco
        if (!cliente || typeof cliente !== 'string' || cliente.trim() === '') {
            throw new ValidationError('RN-00: El nombre del cliente es obligatorio.');
        }
        // RN-01: Una orden debe contener al menos un producto
        if (!productos || productos.length === 0) {
            throw new ValidationError('RN-01: La orden debe contener al menos un producto.');
        }
        // RN-02: La cantidad de cada producto debe ser mayor que cero
        const hasInvalidQuantity = productos.some(p => p.cantidad <= 0);
        if (hasInvalidQuantity) {
            throw new ValidationError('RN-02: La cantidad de cada producto debe ser mayor que cero.');
        }
        const hasInvalidPrice = productos.some(p => p.valorUnitario <= 0 || isNaN(p.valorUnitario));
        if (hasInvalidPrice) {
            throw new ValidationError('El valor unitario de cada producto debe ser mayor que cero.');
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
            throw new NotFoundError('Orden no encontrada.');
        }
        return order;
    }

    getAllOrders(): Order[] {
        return [...this.orders]; // returns a copy of the array to prevent modification by external code
    }

    updateOrderStatus(id: string, nuevoEstado: OrderStatus): Order {
        const order = this.getOrderById(id);
        if (!OrderService.VALID_TRANSITIONS[order.estado].includes(nuevoEstado)) {
            // RN-05: Una orden no puede ser enviada si no ha sido pagada
            if (nuevoEstado === OrderStatus.ENVIADA && order.estado !== OrderStatus.PAGADA) {
                throw new ValidationError('RN-05: Una orden no puede ser enviada si no ha sido pagada.');
            }
            throw new ValidationError(`RN-06: Transición inválida de ${order.estado} a ${nuevoEstado}.`);
        }
        order.estado = nuevoEstado;
        return order;
    }

    cancelOrder(id: string): Order {
        const order = this.getOrderById(id);

        // RN-04: Una orden entregada no puede ser cancelada
        if (order.estado === OrderStatus.ENTREGADA) {
            throw new ConflictError('RN-04: Una orden entregada no puede ser cancelada.');
        }
        return this.updateOrderStatus(id, OrderStatus.CANCELADA);
    }

    // In OrderService:
    clearOrders(): void {
        this.orders = [];
    }

}

// Export one single instance
export const orderService = new OrderService();