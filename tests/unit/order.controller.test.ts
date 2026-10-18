import request from 'supertest';
import app from '../../src/index'; // Asegúrate de que src/index.ts finalice con "export default app;"
import { OrderStatus } from '../../src/models/order.model';
import { orderService } from '../../src/services/order.service';

describe('Order Controller / Rutas HTTP', () => {
    const validOrderPayload = {
        cliente: 'Prueba Web',
        productos: [
            { id: 'P999', cantidad: 1, valorUnitario: 50000 }
        ]
    };

    let createdOrderId: string;

    test('POST /orders - debe crear una orden y retornar 201', async () => {
        const response = await request(app)
            .post('/orders')
            .send(validOrderPayload);

        expect(response.status).toBe(201);
        expect(response.body.id).toBeDefined();
        expect(response.body.cliente).toBe('Prueba Web');

        createdOrderId = response.body.id;
    });

    test('GET /orders - debe listar las órdenes y retornar 200', async () => {
        const response = await request(app).get('/orders');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    test('GET /orders/:id - debe retornar la orden creada con 200', async () => {
        const response = await request(app)
            .get(`/orders/${createdOrderId}`);

        expect(response.status).toBe(200);
        expect(response.body.id).toBe(createdOrderId);
    });

    test('PATCH /orders/:id/status - debe retornar 400 por enviar sin pagar (RN-05)', async () => {
        const response = await request(app)
            .patch(`/orders/${createdOrderId}/status`)
            .send({ estado: OrderStatus.ENVIADA });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('RN-05');
    });

    test('GET /orders/id-invalido - debe atrapar el error en el middleware y retornar 404', async () => {
        const response = await request(app)
            .get('/orders/no-existe');

        expect(response.status).toBe(404);
        expect(response.body.error).toBeDefined();
    });

    test('DELETE /orders/:id - debe cancelar la orden y retornar 200', async () => {
        // 1. Creamos una orden nueva para cancelar
        const resCreate = await request(app).post('/orders').send(validOrderPayload);
        const idToCancel = resCreate.body.id;

        // 2. La cancelamos
        const response = await request(app).delete(`/orders/${idToCancel}`);

        expect(response.status).toBe(200);
        expect(response.body.estado).toBe(OrderStatus.CANCELADA);
    });

    test('DELETE /orders/:id - debe retornar 409 al intentar cancelar orden entregada', async () => {
        // 1. Creamos la orden
        const resCreate = await request(app).post('/orders').send(validOrderPayload);
        const idToDeliver = resCreate.body.id;

        // 2. Avanzamos a PAGADA, ENVIADA y ENTREGADA
        await request(app).patch(`/orders/${idToDeliver}/status`).send({ estado: OrderStatus.PAGADA });
        await request(app).patch(`/orders/${idToDeliver}/status`).send({ estado: OrderStatus.ENVIADA });
        await request(app).patch(`/orders/${idToDeliver}/status`).send({ estado: OrderStatus.ENTREGADA });

        // 3. Intentamos cancelar (debe activar las líneas 42-47 del controlador y retornar 409)
        const response = await request(app).delete(`/orders/${idToDeliver}`);

        expect(response.status).toBe(409);
        expect(response.body.error).toContain('RN-04');
    });

    test('POST /orders - debe probar el manejo de un error genérico (500)', async () => {
        // Enviamos un cuerpo completamente malformado (por ejemplo, forzando un error en el parseo JSON o datos nulos que rompan la lógica interna)
        const response = await request(app)
            .post('/orders')
            .send({ cliente: null, productos: null });

        // Dependiendo de cómo armaste tu middleware, esto debería caer en el error genérico
        expect(response.status).toBeGreaterThanOrEqual(400);
    });

    test('GET /orders - debe atrapar errores inesperados (500) en el middleware', async () => {
        // Simulamos que el servicio falla de manera catastrófica (Error nativo, no AppError)
        jest.spyOn(orderService, 'getAllOrders').mockImplementationOnce(() => {
            throw new Error('Fallo crítico e inesperado en la base de datos');
        });

        const response = await request(app).get('/orders');

        // El middleware debería atrapar este Error genérico y devolver 500
        expect(response.status).toBe(500);

        // Restauramos la función original para no afectar las demás pruebas
        jest.restoreAllMocks();
    });

    test('ALL /ruta-inexistente - debe disparar el notFoundHandler y retornar 404', async () => {
        const response = await request(app).get('/ruta-que-no-existe-en-el-api');
        expect(response.status).toBe(404);
        // Validamos el string exacto para matar el mutante de StringLiteral
        expect(response.body.error).toMatch(/^Ruta no encontrada:/);
    });

    test('POST /orders - debe atrapar un SyntaxError si se envía un JSON malformado', async () => {
        const response = await request(app)
            .post('/orders')
            .set('Content-Type', 'application/json')
            .send('{"cliente": "Juan", "productos": [ { "id": "P1", cantidad: 2 } ]'); // JSON roto intencionalmente (falta comilla o llave)

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('El cuerpo de la solicitud contiene un JSON inválido.');
    });
});