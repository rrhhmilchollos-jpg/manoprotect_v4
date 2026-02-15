/**
 * OrdersSection Component - Device Orders Management
 */
import { useState, useEffect } from 'react';
import { Package, RefreshCw, Eye, CheckCircle, XCircle, X, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const OrdersSection = ({ employee, hasPermission }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Pedido actualizado a: ${statusLabels[status] || status}`);
        fetchOrders();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al actualizar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        toast.success('Pedido cancelado');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Error al cancelar');
    }
  };

  const markAsPaid = async (orderId) => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/device-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_status: 'paid', status: 'confirmed' })
      });
      if (res.ok) {
        toast.success('Pago confirmado');
        fetchOrders();
      }
    } catch (err) {
      toast.error('Error al confirmar pago');
    }
  };

  const statusColors = {
    pending_payment: 'bg-yellow-600 text-white',
    pending: 'bg-yellow-600 text-white',
    confirmed: 'bg-blue-600 text-white',
    processing: 'bg-indigo-600 text-white',
    shipped: 'bg-purple-600 text-white',
    delivered: 'bg-emerald-600 text-white',
    cancelled: 'bg-red-600 text-white'
  };

  const statusLabels = {
    pending_payment: 'Pendiente Pago',
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'En Preparación',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const paymentColors = {
    paid: 'bg-emerald-600 text-white',
    pending: 'bg-orange-600 text-white',
    failed: 'bg-red-600 text-white',
    refunded: 'bg-gray-600 text-white'
  };

  return (
    <div className="space-y-6" data-testid="orders-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos de Dispositivos SOS</h1>
          <p className="text-slate-400">Gestión de envíos de botones SOS físicos</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="border-slate-600 text-white hover:bg-slate-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-slate-400 text-sm">Total Pedidos</p>
            <p className="text-2xl font-bold text-white">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-900/30 border-yellow-700">
          <CardContent className="p-4">
            <p className="text-yellow-400 text-sm">Pendientes Pago</p>
            <p className="text-2xl font-bold text-yellow-300">
              {orders.filter(o => o.payment_status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-blue-900/30 border-blue-700">
          <CardContent className="p-4">
            <p className="text-blue-400 text-sm">En Proceso</p>
            <p className="text-2xl font-bold text-blue-300">
              {orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-900/30 border-emerald-700">
          <CardContent className="p-4">
            <p className="text-emerald-400 text-sm">Entregados</p>
            <p className="text-2xl font-bold text-emerald-300">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-white font-semibold">ID Pedido</th>
                <th className="text-left p-4 text-white font-semibold">Cliente</th>
                <th className="text-left p-4 text-white font-semibold">Cantidad</th>
                <th className="text-left p-4 text-white font-semibold">Dirección</th>
                <th className="text-left p-4 text-white font-semibold">Estado</th>
                <th className="text-left p-4 text-white font-semibold">Pago</th>
                <th className="text-right p-4 text-white font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.order_id} className="border-t border-slate-700 hover:bg-slate-700/50">
                    <td className="p-4">
                      <span className="text-white font-mono text-sm bg-slate-700 px-2 py-1 rounded">
                        {order.order_id}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-white font-medium">{order.user_name || order.shipping?.full_name || 'N/A'}</p>
                      <p className="text-slate-400 text-sm">{order.user_email || 'Sin email'}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-bold text-lg">{order.quantity}x</span>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.shipping?.city || 'N/A'}</p>
                      <p className="text-slate-400 text-sm">{order.shipping?.postal_code || ''}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-600 text-white'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentColors[order.payment_status] || 'bg-gray-600 text-white'}`}>
                        {order.payment_status === 'paid' ? 'Pagado' : order.payment_status === 'pending' ? 'Pendiente' : order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedOrder(order); setShowDetailsModal(true); }}
                          className="border-slate-600 text-white hover:bg-slate-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {order.payment_status === 'pending' && order.status !== 'cancelled' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(order.order_id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Pago OK
                          </Button>
                        )}
                        
                        {order.payment_status === 'paid' && !['delivered', 'cancelled'].includes(order.status) && (
                          <select
                            onChange={(e) => e.target.value && updateOrderStatus(order.order_id, e.target.value)}
                            className="text-sm bg-slate-700 border border-slate-600 rounded px-2 py-1.5 text-white cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Cambiar...</option>
                            {order.status !== 'confirmed' && <option value="confirmed">Confirmado</option>}
                            {order.status !== 'processing' && <option value="processing">En Preparación</option>}
                            {order.status !== 'shipped' && <option value="shipped">Enviado</option>}
                            <option value="delivered">Entregado</option>
                          </select>
                        )}
                        
                        {!['delivered', 'cancelled'].includes(order.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelOrder(order.order_id)}
                            className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-white">Detalles del Pedido</CardTitle>
                <CardDescription className="text-slate-400 font-mono">
                  {selectedOrder.order_id}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Status */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedOrder.status]}`}>
                  {statusLabels[selectedOrder.status]}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentColors[selectedOrder.payment_status]}`}>
                  {selectedOrder.payment_status === 'paid' ? 'Pagado' : 'Pago Pendiente'}
                </span>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  Información del Cliente
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Nombre</p>
                    <p className="text-white">{selectedOrder.user_name || selectedOrder.shipping?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <p className="text-white">{selectedOrder.user_email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Teléfono</p>
                    <p className="text-white">{selectedOrder.shipping?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Cantidad</p>
                    <p className="text-white font-bold">{selectedOrder.quantity} dispositivo(s)</p>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Dirección de Envío
                </h4>
                <div className="text-sm">
                  <p className="text-white">{selectedOrder.shipping?.address || 'N/A'}</p>
                  <p className="text-white">{selectedOrder.shipping?.city}, {selectedOrder.shipping?.postal_code}</p>
                  <p className="text-slate-400">{selectedOrder.shipping?.country || 'España'}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-slate-900 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  Información del Pedido
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Total</p>
                    <p className="text-emerald-400 font-bold text-lg">€{selectedOrder.total_price?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fecha Pedido</p>
                    <p className="text-white">
                      {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </p>
                  </div>
                  {selectedOrder.stripe_session_id && (
                    <div className="col-span-2">
                      <p className="text-slate-400">ID Stripe</p>
                      <p className="text-white font-mono text-xs break-all">{selectedOrder.stripe_session_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {selectedOrder.payment_status === 'pending' && selectedOrder.status !== 'cancelled' && (
                  <Button onClick={() => { markAsPaid(selectedOrder.order_id); setShowDetailsModal(false); }} className="bg-emerald-600 hover:bg-emerald-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Pago
                  </Button>
                )}
                {!['delivered', 'cancelled'].includes(selectedOrder.status) && (
                  <Button variant="outline" onClick={() => { cancelOrder(selectedOrder.order_id); setShowDetailsModal(false); }} className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Pedido
                  </Button>
                )}
                <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="border-slate-600 text-white ml-auto">
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
