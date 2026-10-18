import { test, request } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { OrderStatus } from '../enums/OrderStatus';
import { ButtonAction } from '../enums/ButtonActions';
import { ENV } from '../config/env.config';

test.describe.serial('Flujos E2E - Dashboard de Órdenes @E2E', () => {
  const clienteE2E = `Usuario QA ${Date.now()}`;
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    dashboard.setClienteObjetivo(clienteE2E);
    await dashboard.navegar();
  });

  test.afterAll(async () => {
    try {
      const apiContext = await request.newContext();
      const response = await apiContext.get(ENV.API_ORDERS_URL);

      if (response.ok()) {
        const orders = await response.json();
        const testOrder = orders.find((o: any) => o.cliente === clienteE2E);

        if (testOrder) {
          await apiContext.delete(`${ENV.API_ORDERS_URL}/${testOrder.id}`);
          console.log(`🧹 Teardown exitoso: Orden de ${clienteE2E} eliminada.`);
        }
      }
      await apiContext.dispose();
    } catch (error) {
      console.log(`⚠️ Teardown omitido: No se pudo conectar con la API para limpiar.`);
    }
  });

  test('1. Crear orden con múltiples productos', async () => {
    await dashboard.armarYCrearOrden('2');
    await dashboard.validarCarritoVacio();
    await dashboard.validarEstadoOrden(OrderStatus.CREADA);
  });

  test('2. Consultar ordenes y validar desglose', async () => {
    await dashboard.validarDesgloseProducto('2x');
  });

  test('3. Actualizar estado (Transición de CREADA a PAGADA)', async () => {
    await dashboard.hacerClicEnAccion(ButtonAction.PAGAR);
    await dashboard.validarEstadoOrden(OrderStatus.PAGADA);
    await dashboard.validarBotonVisible(ButtonAction.ENVIAR);
  });

  test('4. Cancelar orden', async () => {
    await dashboard.hacerClicEnAccion(ButtonAction.CANCELAR);
    await dashboard.validarEstadoOrden(OrderStatus.CANCELADA);
    await dashboard.validarBotonesOcultos([
      ButtonAction.PAGAR,
      ButtonAction.ENVIAR,
      ButtonAction.ENTREGAR
    ]);
  });
});