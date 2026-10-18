import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/orders';

// Catálogo predeterminado
const CATALOGO = [
  { name: '💻 Laptop Pro 15"', price: 1200 },
  { name: '🖥️ Monitor 27" 4K', price: 350 },
  { name: '⌨️ Teclado Mecánico', price: 100 },
  { name: '🖱️ Mouse Inalámbrico', price: 50 },
  { name: '💿 Licencia SO', price: 150 }
];

// 1. Agregamos la interfaz para los productos que vienen del backend
interface OrderProduct {
  nombre: string;
  cantidad: number;
  valorUnitario: number;
}

interface Order {
  id: string;
  cliente: string;
  estado: string;
  total: number;
  productos: OrderProduct[]; // 2. Agregamos los productos a la orden
}

export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  // Estados del formulario
  const [clienteNombre, setClienteNombre] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProductIdx, setSelectedProductIdx] = useState(0);
  const [cantidad, setCantidad] = useState(1);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(API_URL);
      setOrders(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las órdenes. ¿Está encendida la API?');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const agregarAlCarrito = () => {
    const producto = CATALOGO[selectedProductIdx];
    setCart([...cart, {
      nombre: producto.name,
      cantidad: cantidad,
      valorUnitario: producto.price
    }]);
    setCantidad(1);
  };

  const quitarDelCarrito = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const createOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('Debes agregar al menos un producto a la orden.');
      return;
    }
    try {
      await axios.post(API_URL, {
        cliente: clienteNombre,
        productos: cart
      });
      setClienteNombre('');
      setCart([]);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al crear la orden');
    }
  };

  const updateStatus = async (id: string, nuevoEstado: string) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`, { estado: nuevoEstado });
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al actualizar estado');
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Error al cancelar la orden');
    }
  };

  const getStatusColor = (estado: string) => {
    const colors: Record<string, string> = {
      CREADA: 'bg-blue-100 text-blue-800',
      PAGADA: 'bg-yellow-100 text-yellow-800',
      ENVIADA: 'bg-purple-100 text-purple-800',
      ENTREGADA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  const totalCarrito = cart.reduce((sum, item) => sum + (item.valorUnitario * item.cantidad), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard de Órdenes (QA)</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. Configurar Orden</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
            <input
              type="text"
              required
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej. Eduard el vampiro"
            />
          </div>

          <div className="flex gap-2 items-end mb-4 bg-gray-50 p-4 rounded border">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
              <select
                value={selectedProductIdx}
                onChange={(e) => setSelectedProductIdx(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
              >
                {CATALOGO.map((prod, idx) => (
                  <option key={idx} value={idx}>{prod.name} - ${prod.price}</option>
                ))}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cant.</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <button
              type="button"
              onClick={agregarAlCarrito}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
            >
              Añadir
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. Resumen de la Orden</h2>

          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center mt-4 text-sm">El carrito está vacío.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cart.map((item, idx) => (
                  <li key={idx} className="py-2 flex justify-between items-center text-sm">
                    <span>
                      <span className="font-semibold">{item.cantidad}x</span> {item.nombre}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">${item.valorUnitario * item.cantidad}</span>
                      <button type="button" onClick={() => quitarDelCarrito(idx)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-700">Total Calculado:</span>
              <span className="text-xl font-bold text-indigo-600">${totalCarrito}</span>
            </div>

            <form onSubmit={createOrder}>
              <button
                type="submit"
                disabled={cart.length === 0 || !clienteNombre}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded font-semibold hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmar y Crear Orden
              </button>
            </form>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Órdenes</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600 text-sm">ID (UUID)</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Cliente</th>
              {/* 3. Agregamos la cabecera de Productos */}
              <th className="p-4 font-semibold text-gray-600 text-sm">Productos</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Total</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Estado</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No hay órdenes registradas.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm font-mono text-gray-500" title={o.id}>{o.id.substring(0, 8)}...</td>
                  <td className="p-4 font-medium text-gray-800">{o.cliente}</td>

                  {/* 4. Columna para renderizar la lista de productos */}
                  <td className="p-4 text-sm text-gray-600">
                    {o.productos && o.productos.length > 0 ? (
                      <ul className="list-disc pl-4">
                        {o.productos.map((prod, idx) => (
                          <li key={idx}>
                            <span className="font-semibold">{prod.cantidad}x</span> {prod.nombre}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400 italic">Sin detalle</span>
                    )}
                  </td>

                  <td className="p-4 text-gray-600 font-semibold">${o.total}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(o.estado)}`}>
                      {o.estado}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-end items-center h-full mt-2">
                    {o.estado === 'CREADA' && (
                      <button onClick={() => updateStatus(o.id, 'PAGADA')} className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition font-semibold">Pagar</button>
                    )}
                    {o.estado === 'PAGADA' && (
                      <button onClick={() => updateStatus(o.id, 'ENVIADA')} className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded hover:bg-purple-200 transition font-semibold">Enviar</button>
                    )}
                    {o.estado === 'ENVIADA' && (
                      <button onClick={() => updateStatus(o.id, 'ENTREGADA')} className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition font-semibold">Entregar</button>
                    )}
                    {o.estado !== 'ENTREGADA' && o.estado !== 'CANCELADA' && (
                      <button onClick={() => cancelOrder(o.id)} className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200 transition font-semibold">Cancelar</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}