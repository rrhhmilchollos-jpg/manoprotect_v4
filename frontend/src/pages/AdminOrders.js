/**
 * ManoProtect - Admin Panel de Pedidos
 * Gestión completa de pedidos de dispositivos SOS y relojes
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Package, Truck, CheckCircle, Clock, AlertCircle, 
  Search, Filter, Download, RefreshCw, ChevronDown,
  User, Mail, Phone, MapPin, CreditCard, Eye, Edit,
  X, Save, ArrowLeft, FileText, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const API = process.env.REACT_APP_BACKEND_URL;

// Status colors and labels
const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  pending_payment: { label: 'Pago Pendiente', color: 'bg-orange-100 text-orange-800', icon: CreditCard },
  processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertCircle }
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tracking_number: '',
    shipping_carrier: '',
    notes: ''
  });
  const [updating, setUpdating] = useState(false);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API}/api/admin/device-orders?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (response.status === 403) {
        toast.error('Acceso denegado. Inicia sesión como administrador.');
        navigate('/login');
        return;
      }
      
      if (!response.ok) throw new Error('Error al cargar pedidos');
      
      const data = await response.json();
      setOrders(data.orders || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        fetchOrders();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Open order detail
  const openOrderDetail = async (order) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status || 'pending',
      tracking_number: order.tracking_number || '',
      shipping_carrier: order.shipping_carrier || 'Correos Express',
      notes: order.notes || ''
    });
    setEditMode(false);
    setShowOrderModal(true);
  };

  // Update order
  const updateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`${API}/api/admin/device-orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      
      const data = await response.json();
      toast.success('Pedido actualizado correctamente');
      
      // Update local state
      setOrders(orders.map(o => o.order_id === selectedOrder.order_id ? data.order : o));
      setSelectedOrder(data.order);
      setEditMode(false);
      
      // Refresh stats
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el pedido');
    } finally {
      setUpdating(false);
    }
  };

  // Export to CSV
  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`${API}/api/admin/device-orders/export/csv?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error al exportar');
      
      const data = await response.json();
      
      // Convert to CSV string
      const csvContent = data.rows.map(row => 
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ).join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `pedidos_manoprotect_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success(`Exportados ${data.total} pedidos`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const StatusIcon = STATUS_CONFIG[selectedOrder?.status]?.icon || Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Gestión de Pedidos | Admin ManoProtect</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/admin')}
              data-testid="back-to-admin"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Admin
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gestión de Pedidos</h1>
              <p className="text-sm text-gray-500">Dispositivos SOS y Relojes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchOrders}
              data-testid="refresh-orders"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportCSV}
              data-testid="export-csv"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-500">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700">Procesando</p>
              <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700">Enviados</p>
              <p className="text-2xl font-bold text-purple-700">{stats.shipped}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700">Entregados</p>
              <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por email, nombre, ID pedido o DNI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="search-orders"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['all', 'pending', 'processing', 'shipped', 'delivered'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  data-testid={`filter-${status}`}
                >
                  {status === 'all' ? 'Todos' : STATUS_CONFIG[status]?.label || status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
              <p className="mt-2 text-gray-500">Cargando pedidos...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto text-gray-300" />
              <p className="mt-2 text-gray-500">No hay pedidos que mostrar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => {
                    const shipping = order.shipping_address || {};
                    const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={order.order_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            #{(order.order_id || '').slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {order.client_name || shipping.fullName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">{order.client_email || 'Sin email'}</p>
                            {(order.client_phone || shipping.phone) && (
                              <p className="text-xs text-gray-500">{order.client_phone || shipping.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-600 max-w-[200px]">
                            <p>{shipping.street || shipping.address || 'Sin dirección'}</p>
                            <p>{shipping.city}, {shipping.postal_code || shipping.postalCode}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium">{order.quantity || 1}x Dispositivo</p>
                            {order.colors && (
                              <p className="text-xs text-gray-500">
                                {Array.isArray(order.colors) ? order.colors.join(', ') : order.colors}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                          {order.tracking_number && (
                            <p className="text-xs text-gray-500 mt-1">{order.tracking_number}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('es-ES') : 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetail(order)}
                            data-testid={`view-order-${order.order_id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowOrderModal(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pedido #{(selectedOrder.order_id || '').slice(0, 8).toUpperCase()}
                </h2>
                <Badge className={STATUS_CONFIG[selectedOrder.status]?.color || 'bg-gray-100'}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {STATUS_CONFIG[selectedOrder.status]?.label || selectedOrder.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={updateOrder} disabled={updating}>
                    <Save className="w-4 h-4 mr-1" />
                    {updating ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowOrderModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Cliente Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Datos del Cliente
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Nombre</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedOrder.client_name || selectedOrder.shipping_address?.fullName || 'N/A'}
                      <button onClick={() => copyToClipboard(selectedOrder.client_name || selectedOrder.shipping_address?.fullName || '')}>
                        <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </button>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedOrder.client_email || 'N/A'}
                      {selectedOrder.client_email && (
                        <button onClick={() => copyToClipboard(selectedOrder.client_email)}>
                          <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Teléfono</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedOrder.client_phone || selectedOrder.shipping_address?.phone || 'N/A'}
                      <button onClick={() => copyToClipboard(selectedOrder.client_phone || selectedOrder.shipping_address?.phone || '')}>
                        <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                      </button>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">DNI</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedOrder.shipping_address?.dni || 'N/A'}
                      {selectedOrder.shipping_address?.dni && (
                        <button onClick={() => copyToClipboard(selectedOrder.shipping_address?.dni)}>
                          <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dirección Envío */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Dirección de Envío
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{selectedOrder.shipping_address?.street || selectedOrder.shipping_address?.address || 'Sin dirección'}</p>
                  <p>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postal_code || selectedOrder.shipping_address?.postalCode}</p>
                  <p>{selectedOrder.shipping_address?.province}</p>
                  <button 
                    onClick={() => copyToClipboard(`${selectedOrder.shipping_address?.street || ''}, ${selectedOrder.shipping_address?.postal_code || ''} ${selectedOrder.shipping_address?.city || ''}, ${selectedOrder.shipping_address?.province || ''}`)}
                    className="text-[#4CAF50] hover:underline flex items-center gap-1 mt-2"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar dirección completa
                  </button>
                </div>
              </div>

              {/* Producto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Producto
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Cantidad</p>
                    <p className="font-medium">{selectedOrder.quantity || 1} unidad(es)</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Colores</p>
                    <p className="font-medium">
                      {Array.isArray(selectedOrder.colors) ? selectedOrder.colors.join(', ') : selectedOrder.colors || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Estilo</p>
                    <p className="font-medium">{selectedOrder.device_style || 'Estándar'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Coste Envío</p>
                    <p className="font-medium">{(selectedOrder.shipping_cost || 4.95).toFixed(2)}€</p>
                  </div>
                </div>
              </div>

              {/* Estado y Tracking (Editable) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Estado del Envío
                </h3>
                
                {editMode ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Estado</label>
                      <select
                        value={updateData.status}
                        onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="processing">Procesando</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Nº Seguimiento</label>
                      <Input
                        value={updateData.tracking_number}
                        onChange={(e) => setUpdateData({...updateData, tracking_number: e.target.value})}
                        placeholder="Número de tracking"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Transportista</label>
                      <select
                        value={updateData.shipping_carrier}
                        onChange={(e) => setUpdateData({...updateData, shipping_carrier: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="Correos Express">Correos Express</option>
                        <option value="SEUR">SEUR</option>
                        <option value="MRW">MRW</option>
                        <option value="GLS">GLS</option>
                        <option value="UPS">UPS</option>
                        <option value="DHL">DHL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Notas internas</label>
                      <textarea
                        value={updateData.notes}
                        onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        rows={2}
                        placeholder="Notas sobre el pedido..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Nº Seguimiento</p>
                      <p className="font-medium flex items-center gap-2">
                        {selectedOrder.tracking_number || 'Sin asignar'}
                        {selectedOrder.tracking_number && (
                          <button onClick={() => copyToClipboard(selectedOrder.tracking_number)}>
                            <Copy className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Transportista</p>
                      <p className="font-medium">{selectedOrder.shipping_carrier || 'No asignado'}</p>
                    </div>
                    {selectedOrder.shipped_at && (
                      <div>
                        <p className="text-gray-500">Fecha Envío</p>
                        <p className="font-medium">{new Date(selectedOrder.shipped_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    )}
                    {selectedOrder.delivered_at && (
                      <div>
                        <p className="text-gray-500">Fecha Entrega</p>
                        <p className="font-medium">{new Date(selectedOrder.delivered_at).toLocaleDateString('es-ES')}</p>
                      </div>
                    )}
                    {selectedOrder.notes && (
                      <div className="col-span-2">
                        <p className="text-gray-500">Notas</p>
                        <p className="font-medium">{selectedOrder.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="text-xs text-gray-500 flex justify-between">
                <span>Creado: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString('es-ES') : 'N/A'}</span>
                {selectedOrder.updated_at && (
                  <span>Actualizado: {new Date(selectedOrder.updated_at).toLocaleString('es-ES')}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
