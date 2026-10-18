# Reporte Técnico de QA Automation: Arquitectura E2E Playwright

---

## 1. Escenarios de Prueba Faltantes (Edge Cases, Flujos Negativos y Alternativos)

Basado en el análisis de la máquina de estados de las órdenes y la matriz de interacciones de la interfaz, se identifican los siguientes tres escenarios críticos actualmente no cubiertos:

### Escenario A: Validación de límites y manejo de errores en la creación de órdenes (Edge Case / Negativo)
* **Objetivo:** Verificar que el sistema rechaza la creación de una orden con cantidades inválidas (ej. cero, negativos o caracteres especiales) y previene la contaminación de datos en el dashboard.
* **Precondiciones:** Usuario en el Dashboard con un cliente objetivo configurado.
* **Pasos de Prueba:**
  1. Ingresar un valor de cantidad inválido (`0`, `-1` o un string no numérico).
  2. Intentar hacer clic en el botón de añadir al carrito o confirmar orden.
  3. Validar que el botón de confirmación permanezca deshabilitado (`disabled`) o que se despliegue un mensaje de error validado en UI.
* **Criterio de Aceptación:** El sistema no permite avanzar con la transacción y muestra una alerta visual clara de validación de campos.

### Escenario B: Flujo Completo Exitoso E2E (Happy Path Secuencial Extendido: CREADA ➔ PAGADA ➔ ENVIADA ➔ ENTREGADA)
* **Objetivo:** Validar la transición ininterrumpida de todos los estados válidos del ciclo de vida de la orden hasta su cierre definitivo.
* **Precondiciones:** Orden creada en estado `CREADA`.
* **Pasos de Prueba:**
  1. Ejecutar transición `PAGAR` $\rightarrow$ Validar estado `PAGADA`.
  2. Ejecutar transición `ENVIAR` $\rightarrow$ Validar estado `ENVIADA`.
  3. Ejecutar transición `ENTREGAR` $\rightarrow$ Validar estado `ENTREGADA`.
  4. Validar que una vez alcanzado el estado final (`ENTREGADA`), todos los botones de acción (`PAGAR`, `ENVIAR`, `ENTREGAR`, `CANCELAR`) estén ocultos o inhabilitados.
* **Criterio de Aceptación:** La orden transiciona correctamente por cada eslabón del negocio y bloquea cualquier acción posterior al estado terminal de entrega.

### Escenario C: Intento de transición inválida por concurrencia o estado alterado (Flujo Negativo / Robustez)
* **Objetivo:** Comprobar la resiliencia de la interfaz ante un intento de ejecutar una acción no permitida por la máquina de estados (ej. intentar `ENTREGAR` una orden que aún se encuentra en estado `CREADA`).
* **Precondiciones:** Orden recién creada en estado `CREADA`.
* **Pasos de Prueba:**
  1. Forzar la visibilidad o interacción del botón `ENTREGAR` (o simular la petición si se manipuló el DOM).
  2. Validar el comportamiento del sistema ante la violación de la regla de negocio.
* **Criterio de Aceptación:** La UI debe ocultar los botones no correspondientes al estado actual (como ya se valida parcialmente en `validarBotonesOcultos`), y el backend/frontend debe rechazar la operación devolviendo un error controlado sin romper la sesión del usuario.

---

## 2. Recomendaciones de Diseño de Pruebas Basadas en Riesgo

### Recomendación 1: Desacoplamiento de Dependencias Secuenciales y Aislamiento de Estado (Principio FIRST / SOLID)
* **Análisis de Riesgo:** Actualmente, las pruebas E2E están configuradas con `test.describe.serial` utilizando un único cliente compartido (`clienteE2E`) y pruebas encadenadas (ej. la prueba 2 depende de la orden creada en la prueba 1; la prueba 3 depende del estado anterior). Si la prueba 1 falla, **todo el bloque subsiguiente colapsa por efecto dominó**, generando falsos negativos y dificultando la depuración (Debugging).
* **Propuesta de Mejora:** 
  - Migrar los tests para que sean **totalmente independientes**. Cada `test()` debe levantar su propia data de prueba (idealmente vía API *Setup* o *Fixture* de Playwright antes de cada test) asegurando idempotencia.
  - Implementar *Playwright Fixtures* personalizados para inyectar estados de órdenes pre-creadas en la base de datos vía API, reduciendo el tiempo de ejecución en la capa UI y elevando la robustez arquitectónica.

### Recomendación 2: Implementación de Patrón de Arquitectura Limpia y Separación de Responsabilidades (Locator Encapsulation & Test Data Builders)
* **Análisis de Riesgo:** El `DashboardPage` actualmente mezcla lógica de estado de negocio local (`clienteEnFoco`) con la manipulación del DOM y aserciones genéricas de Playwright. A medida que la aplicación escale, la gestión de mutaciones en memoria dentro del Page Object puede causar condiciones de carrera (*race conditions*) en ejecuciones paralelas (`workers > 1`).
* **Propuesta de Mejora:**
  - Extraer los datos de prueba hacia un patrón *Data Builder* o generadores tipados.
  - Asegurar que el Page Object Model (POM) actúe estrictamente como una capa de transporte de UI (análogo a un adaptador en Arquitectura Hexagonal), removiendo lógica condicional compleja de negocio (`if (!this.clienteEnFoco) throw...`) y delegando la construcción del estado a objetos de transferencia de datos (DTOs) o fixtures estructurados.

---

## 3. Matriz de Trazabilidad de Pruebas E2E

| Acción de Botón (`ButtonAction`) | Estado Inicial de la Orden | Estado Esperado de la Orden (`OrderStatus`) | Botones Visibles Post-Acción | Botones Ocultos Post-Acción | Estado de Automatización |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Añadir / Confirmar** | Carrito con ítems | `CREADA` | `PAGAR`, `CANCELAR` | `ENVIAR`, `ENTREGAR`, `CONFIRMAR` | ✅ Automatizado |
| **Pagar** | `CREADA` | `PAGADA` | `ENVIAR`, `CANCELAR` | `PAGAR`, `ENTREGAR`, `CREADA` | ✅ Automatizado |
| **Enviar** | `PAGADA` | `ENVIADA` | `ENTREGAR` | `PAGAR`, `ENVIAR`, `CANCELAR` | ❌ Pendiente |
| **Entregar** | `ENVIADA` | `ENTREGADA` | Ninguno (Estado Terminal) | `PAGAR`, `ENVIAR`, `ENTREGAR`, `CANCELAR` | ❌ Pendiente |
| **Cancelar** | `CREADA` (o `PAGADA`) | `CANCELADA` | Ninguno (Estado Terminal) | `PAGAR`, `ENVIAR`, `ENTREGAR`, `CANCELAR` | ✅ Automatizado |