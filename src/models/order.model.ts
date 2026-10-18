
import type { Product } from './product.model';

export enum OrderStatus {
    CREADA = 'CREADA',
    PAGADA = 'PAGADA',
    ENVIADA = 'ENVIADA',
    ENTREGADA = 'ENTREGADA',
    CANCELADA = 'CANCELADA'
}

export interface Order {
    id: string; // UUID
    cliente: string;
    productos: Product[];
    total: number;
    estado: OrderStatus;
}