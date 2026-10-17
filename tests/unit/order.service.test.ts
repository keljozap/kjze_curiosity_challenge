import { OrderService, orderService } from '../../src/services/order.service';
import { OrderStatus } from '../../src/models/order.model';
import { Product } from '../../src/models/product.model';
import { describe, expect, test } from '@jest/globals';

describe('OrderService', () => {
    let newOrderService: OrderService;
    let validProducts: Product[];
    beforeEach(() => {
        newOrderService = new OrderService();
        newOrderService.clearOrders();
        validProducts = [
            { id: 'P001', cantidad: 2, valorUnitario: 100000 },
            { id: 'P002', cantidad: 1, valorUnitario: 50000 }
        ];
    });

    describe('Creación de Ordenes - Happy Path ', () => {
        // HP-01: Creación básica y validación de propiedades iniciales
        test('debe crear una orden exitosamente con estado CREADA y sus datos completos', () => {
            const cliente = 'Juan Pérez';
            const order = newOrderService.createOrder(cliente, validProducts);
            expect(order).toBeDefined();
            expect(order.id).toBeDefined();
            expect(typeof order.id).toBe('string');
            expect(order.id.trim().length).toBeGreaterThan(0);
            expect(order.cliente).toBe(cliente);
            expect(order.productos).toEqual(validProducts);
            expect(order.estado).toBe(OrderStatus.CREADA);
        });

        // HP-02: Cálculo automático del total con un solo producto (RN-03)
        test('debe calcular el total correctamente para una orden con un solo producto', () => {
            const productoUnico: Product[] = [
                { id: 'P001', cantidad: 3, valorUnitario: 15000 }
            ];
            const order = newOrderService.createOrder('Ana Gómez', productoUnico);
            // 3 * 15000 = 45000
            expect(order.total).toBe(45000);
            expect(order.productos).toHaveLength(1);
        });
        // HP-03: Cálculo acumulativo con múltiples productos y cantidades (RN-03)
        test('debe calcular el total sumando (cantidad * valorUnitario) de todos los productos', () => {
            const multiplesProductos: Product[] = [
                { id: 'P001', cantidad: 2, valorUnitario: 10000 }, // 20000
                { id: 'P002', cantidad: 3, valorUnitario: 5000 },  // 15000
                { id: 'P003', cantidad: 1, valorUnitario: 25000 }  // 25000
            ];
            const order = newOrderService.createOrder('Carlos Ruiz', multiplesProductos);
            // 20000 + 15000 + 25000 = 60000
            expect(order.total).toBe(60000);
        });
        // HP-04: Persistencia y almacenamiento en memoria
        test('debe guardar la orden creada en la lista interna de órdenes', () => {
            const order = newOrderService.createOrder('María López', validProducts);
            // Verificar que se puede recuperar por su ID
            const ordenRecuperada = newOrderService.getOrderById(order.id);
            expect(ordenRecuperada).toEqual(order);
            // Verificar que está presente en la lista global
            const todas = newOrderService.getAllOrders();
            expect(todas).toContainEqual(order);
        });
        // HP-05: Unicidad de identificadores al crear múltiples órdenes
        test('debe generar identificadores únicos para órdenes consecutivas', () => {
            const order1 = newOrderService.createOrder('Cliente 1', validProducts);
            const order2 = newOrderService.createOrder('Cliente 2', validProducts);
            expect(order1.id).not.toBe(order2.id);
            expect(newOrderService.getAllOrders()).toHaveLength(2);
        });
    });

    describe('Creación de Ordenes - Negative tests', () => {

    })
})
