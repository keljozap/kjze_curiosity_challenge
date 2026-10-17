import { OrderService } from '../../src/services/order.service';
import { OrderStatus } from '../../src/models/order.model';
import { Product } from '../../src/models/product.model';
import { describe, expect, test } from '@jest/globals';
import { ValidationError, NotFoundError, ConflictError } from '../../src/errors/app.error';

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
        // NP-01: Fallo al intentar crear una orden sin productos (RN-01)
        test('debe arrojar ValidationError si el arreglo de productos está vacío', () => {
            expect(() => {
                newOrderService.createOrder('Laura Díaz', []);
            }).toThrow(ValidationError);

            expect(() => {
                newOrderService.createOrder('Laura Díaz', []);
            }).toThrow('RN-01: La orden debe contener al menos un producto.');
        });

        // NP-02: Fallo al intentar crear una orden con productos indefinidos o nulos (RN-01)
        test('debe arrojar ValidationError si la lista de productos es nula', () => {
            // Usamos as unknown as Product[] para simular un fallo en tiempo de ejecución
            expect(() => {
                newOrderService.createOrder('Luis Soto', null as unknown as Product[]);
            }).toThrow(ValidationError);

            expect(() => {
                newOrderService.createOrder('Luis Soto', undefined as unknown as Product[]);
            }).toThrow('RN-01: La orden debe contener al menos un producto.');
        });

        // NP-03: Fallo al intentar crear una orden con cantidad de producto igual a cero (RN-02)
        test('debe arrojar ValidationError si algún producto tiene cantidad igual a cero', () => {
            const productosCantidadCero: Product[] = [
                { id: 'P001', cantidad: 0, valorUnitario: 10000 }
            ];

            expect(() => {
                newOrderService.createOrder('Pedro Pérez', productosCantidadCero);
            }).toThrow(ValidationError);

            expect(() => {
                newOrderService.createOrder('Pedro Pérez', productosCantidadCero);
            }).toThrow('RN-02: La cantidad de cada producto debe ser mayor que cero.');
        });

        // NP-04: Fallo al intentar crear una orden con cantidad de producto negativa (RN-02)
        test('debe arrojar ValidationError si algún producto en la lista tiene cantidad negativa', () => {
            const productosCantidadNegativa: Product[] = [
                { id: 'P001', cantidad: 2, valorUnitario: 10000 },
                { id: 'P002', cantidad: -3, valorUnitario: 5000 } // Cantidad inválida
            ];

            expect(() => {
                newOrderService.createOrder('Pedro Pérez', productosCantidadNegativa);
            }).toThrow(ValidationError);
        });
    })

    describe('Gestión de Estados y Consultas - Happy Path', () => {
        // NP-05: Fallo al consultar orden que no existe
        test('debe arrojar NotFoundError al consultar una orden que no existe', () => {
            expect(() => {
                newOrderService.getOrderById('id-inexistente');
            }).toThrow(NotFoundError);

            expect(() => {
                newOrderService.getOrderById('id-inexistente');
            }).toThrow('Orden no encontrada.');
        });

        // NP-06: Fallo al cancelar orden entregada (RN-04)
        test('debe arrojar ConflictError al intentar cancelar una orden entregada (RN-04)', () => {
            const order = newOrderService.createOrder('Juan', validProducts);

            // Llevamos la orden hasta el estado ENTREGADA
            newOrderService.updateOrderStatus(order.id, OrderStatus.PAGADA);
            newOrderService.updateOrderStatus(order.id, OrderStatus.ENVIADA);
            newOrderService.updateOrderStatus(order.id, OrderStatus.ENTREGADA);

            expect(() => {
                newOrderService.cancelOrder(order.id);
            }).toThrow(ConflictError);

            expect(() => {
                newOrderService.cancelOrder(order.id);
            }).toThrow('RN-04: Una orden entregada no puede ser cancelada.');
        });

        // NP-07: Fallo al enviar orden no pagada (RN-05)
        test('debe arrojar ValidationError al intentar enviar una orden no pagada (RN-05)', () => {
            const order = newOrderService.createOrder('Juan', validProducts);

            // Intentar pasar de CREADA a ENVIADA directamente
            expect(() => {
                newOrderService.updateOrderStatus(order.id, OrderStatus.ENVIADA);
            }).toThrow(ValidationError);

            expect(() => {
                newOrderService.updateOrderStatus(order.id, OrderStatus.ENVIADA);
            }).toThrow('RN-05: Una orden no puede ser enviada si no ha sido pagada.');
        });

        // NP-08: Fallo por transición inválida genérica (RN-06)
        test('debe arrojar ValidationError ante transiciones inválidas de estado (RN-06)', () => {
            const order = newOrderService.createOrder('Juan', validProducts);

            // Intentar pasar de CREADA a ENTREGADA de golpe
            expect(() => {
                newOrderService.updateOrderStatus(order.id, OrderStatus.ENTREGADA);
            }).toThrow(ValidationError);
        });
    })
})
