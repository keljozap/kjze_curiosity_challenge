import { Page, Locator, expect } from '@playwright/test';
import { OrderStatus } from '../enums/OrderStatus';
import { ButtonAction } from '../enums/ButtonActions';
import { ENV } from '../config/env.config';

export class DashboardPage {
    readonly page: Page;
    private clienteEnFoco: string = '';
    readonly inputCliente: Locator;
    readonly inputCantidad: Locator;
    readonly btnAnadir: Locator;
    readonly btnConfirmar: Locator;
    readonly mensajeCarritoVacio: Locator;

    constructor(page: Page) {
        this.page = page;
        // 2. Usar la configuración para el placeholder
        this.inputCliente = page.getByPlaceholder(ENV.PLACEHOLDERS.CLIENTE);
        this.inputCantidad = page.locator('input[type="number"]').first();
        this.btnAnadir = page.getByRole('button', { name: ButtonAction.ANADIR });
        this.btnConfirmar = page.getByRole('button', { name: ButtonAction.CONFIRMAR });
        this.mensajeCarritoVacio = page.getByText('El carrito está vacío.');
    }

    setClienteObjetivo(cliente: string) {
        this.clienteEnFoco = cliente;
    }

    private get filaOrden(): Locator {
        if (!this.clienteEnFoco) throw new Error('Debes llamar a setClienteObjetivo() primero');
        return this.page.getByRole('row').filter({ hasText: this.clienteEnFoco }).first();
    }

    async navegar() {
        // 3. Usar la configuración para la URL
        await this.page.goto(ENV.FRONTEND_URL);
    }

    async armarYCrearOrden(cantidad: string) {
        await this.inputCliente.fill(this.clienteEnFoco);
        await this.inputCantidad.fill(cantidad);
        await this.btnAnadir.click();
        await this.btnConfirmar.click();
    }

    async hacerClicEnAccion(nombreBoton: ButtonAction) {
        await this.filaOrden.getByRole('button', { name: nombreBoton }).click();
    }

    async validarCarritoVacio() {
        await expect(this.mensajeCarritoVacio).toBeVisible();
    }

    async validarEstadoOrden(estado: OrderStatus) {
        await expect(this.filaOrden).toBeVisible();
        await expect(this.filaOrden).toContainText(estado);
    }

    async validarDesgloseProducto(textoDesglose: string) {
        await expect(this.filaOrden.getByRole('listitem').first()).toContainText(textoDesglose);
    }

    async validarBotonVisible(nombreBoton: ButtonAction) {
        await expect(this.filaOrden.getByRole('button', { name: nombreBoton })).toBeVisible();
    }

    async validarBotonesOcultos(nombresBotones: ButtonAction[]) {
        for (const boton of nombresBotones) {
            await expect(this.filaOrden.getByRole('button', { name: boton })).toBeHidden();
        }
    }
}