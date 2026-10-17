Feature: Pruebas de Aceptación - API de Órdenes

  Background:
    # Apuntamos a la API levantada en local
    # * url 'http://localhost:3001'
    * url 'http://host.docker.internal:3001'

  Scenario: Crear una orden válida
    # Given una orden válida
    Given path 'orders'
    And request { cliente: 'Cliente Válido', productos: [{ id: 'P001', cantidad: 1, valorUnitario: 10000 }] }
    # When se crea la orden
    When method post
    # Then responde 201
    Then status 201
    And match response.estado == 'CREADA'

  Scenario: Consultar una orden existente
    # Setup: Creamos la orden para asegurar que existe
    Given path 'orders'
    And request { cliente: 'Cliente Consulta', productos: [{ id: 'P002', cantidad: 2, valorUnitario: 5000 }] }
    When method post
    Then status 201
    * def orderId = response.id

    # Given una orden existente
    Given path 'orders', orderId
    # When la consulto
    When method get
    # Then responde 200
    Then status 200
    And match response.id == orderId

  Scenario: Intentar enviar una orden no pagada
    # Setup: Creamos la orden (por defecto nace en CREADA)
    Given path 'orders'
    And request { cliente: 'Cliente Envío', productos: [{ id: 'P003', cantidad: 1, valorUnitario: 15000 }] }
    When method post
    Then status 201
    * def orderId = response.id

    # Given una orden creada
    Given path 'orders', orderId, 'status'
    And request { estado: 'ENVIADA' }
    # When intento enviarla
    When method patch
    # Then responde 400
    Then status 400

  Scenario: Intentar cancelar una orden entregada
    # Setup: Creamos la orden
    Given path 'orders'
    And request { cliente: 'Cliente Cancelación', productos: [{ id: 'P004', cantidad: 1, valorUnitario: 20000 }] }
    When method post
    Then status 201
    * def orderId = response.id

    # Llevamos la orden hasta el estado ENTREGADA
    Given path 'orders', orderId, 'status'
    And request { estado: 'PAGADA' }
    When method patch
    
    Given path 'orders', orderId, 'status'
    And request { estado: 'ENVIADA' }
    When method patch
    
    Given path 'orders', orderId, 'status'
    And request { estado: 'ENTREGADA' }
    When method patch

    # Given una orden entregada
    Given path 'orders', orderId
    # When intento cancelarla
    When method delete
    # Then responde 409
    Then status 409

    Scenario: Rechazar la creación de una orden sin productos (RN-01)
    Given path 'orders'
    And request { cliente: 'Cliente Sin Productos', productos: [] }
    When method post
    Then status 400
    And match response.error != null

    Scenario: Rechazar la creación por cantidades o precios inválidos (RN-02)
    Given path 'orders'
    And request { cliente: 'Cliente Invalido', productos: [{ id: 'P005', cantidad: 0, valorUnitario: -100 }] }
    When method post
    Then status 400
    And match response.error != null

    Scenario: Rechazar transición de estado inválida (RN-06)
    # Setup: Creamos la orden (estado inicial CREADA)
    Given path 'orders'
    And request { cliente: 'Cliente Transición', productos: [{ id: 'P006', cantidad: 1, valorUnitario: 5000 }] }
    When method post
    Then status 201
    * def orderId = response.id

    # Acción: Intentar pasar directamente a ENTREGADA
    Given path 'orders', orderId, 'status'
    And request { estado: 'ENTREGADA' }
    When method patch
    Then status 400
    And match response.error != null

    Scenario: Consultar una orden inexistente
    Given path 'orders', 'id-falso-que-no-existe-12345'
    When method get
    Then status 404
    And match response.error != null

    