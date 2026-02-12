/**
 * ManoProtect - Shipping Admin Panel
 * Panel interno para gestionar envíos de dispositivos SOS
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Package, Truck, Search, Filter, Download, RefreshCw, Check, Clock,
  MapPin, Phone, User, ChevronDown, AlertCircle, CheckCircle, XCircle,
  ArrowLeft, Home, Edit2, Save, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUS_LABELS = {
  pending_shipment: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
  preparing: { label: 'Preparando', color: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700' },
  in_transit: { label: 'En tránsito', color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { label: 'En reparto', color: 'bg-cyan-100 text-cyan-700' },
  delivered: { label: 'Entregado', color: 'bg-emerald-100 text-emerald-700' },
  returned: { label: 'Devuelto', color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Cancelado', color: 'bg-zinc-100 text-zinc-700' }
};

export default function ShippingAdmin() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchData();
  }, [filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, carriersRes] = await Promise.all([
        fetch(`${API}/api/admin/shipping/orders${filterStatus ? `?status=${filterStatus}` : ''}`),
        fetch(`${API}/api/admin/shipping/carriers`)
      ]);
      
      const ordersData = await ordersRes.json();
      const carriersData = await carriersRes.json();
      
      setOrders(ordersData.orders || []);
      setStats(ordersData.stats || {});
      setCarriers(carriersData.carriers || []);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order._id);
    setEditForm({
      tracking_number: order.tracking_number || '',
      carrier: order.carrier || '',
      order_status: order.order_status || 'pending_shipment',
      notes: order.notes || ''
    });
  };

  const handleSaveOrder = async (orderId) => {
    try {
      const response = await fetch(`${API}/api/admin/shipping/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        toast.success('Pedido actualizado');
        setEditingOrder(null);
        fetchData();
      } else {
        toast.error('Error al actualizar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const handleQuickShip = async (orderId) => {
    const tracking = prompt('Número de seguimiento:');
    if (!tracking) return;
    
    const carrier = prompt('Transportista (correos, seur, mrw, gls, dhl):');
    if (!carrier) return;
    
    try {
      const response = await fetch(`${API}/api/admin/shipping/orders/${orderId}/ship?tracking_number=${tracking}&carrier=${carrier}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast.success('Pedido marcado como enviado');
        fetchData();
      } else {
        toast.error('Error al enviar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const shipping = order.shipping || {};
    const search = searchQuery.toLowerCase();
    return (
      shipping.fullName?.toLowerCase().includes(search) ||
      shipping.phone?.includes(search) ||
      shipping.city?.toLowerCase().includes(search) ||
      order.tracking_number?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Helmet>
        <title>Panel de Envíos - ManoProtect Admin</title>
      </Helmet>
      
      <div className="min-h-screen bg-zinc-100">
        {/* Header */}
        <header className="bg-zinc-900 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin')}
                  className="text-white/80 hover:text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold flex items-center gap-2">
                    <Truck className="w-6 h-6" />
                    Panel de Envíos
                  </h1>
                  <p className="text-white/60 text-sm">Gestión de envíos de dispositivos SOS</p>
                </div>
              </div>
              <Button onClick={fetchData} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: stats.total || 0, color: 'bg-zinc-600' },
              { label: 'Pendientes', value: stats.pending || 0, color: 'bg-amber-500' },
              { label: 'Preparando', value: stats.preparing || 0, color: 'bg-blue-500' },
              { label: 'Enviados', value: stats.shipped || 0, color: 'bg-indigo-500' },
              { label: 'En tránsito', value: stats.in_transit || 0, color: 'bg-purple-500' },
              { label: 'Entregados', value: stats.delivered || 0, color: 'bg-emerald-500' }
            ].map((stat, idx) => (
              <Card key={idx} className="overflow-hidden">
                <div className={`h-1 ${stat.color}`} />
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input 
                      placeholder="Buscar por nombre, teléfono, ciudad..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="">Todos los estados</option>
                  {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
                  <p className="text-zinc-500 mt-2">Cargando...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-zinc-300" />
                  <p className="text-zinc-500 mt-2">No hay pedidos</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-zinc-500">
                        <th className="pb-3 pr-4">Cliente</th>
                        <th className="pb-3 pr-4">Dirección</th>
                        <th className="pb-3 pr-4">Producto</th>
                        <th className="pb-3 pr-4">Estado</th>
                        <th className="pb-3 pr-4">Tracking</th>
                        <th className="pb-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const shipping = order.shipping || {};
                        const isEditing = editingOrder === order._id;
                        const statusInfo = STATUS_LABELS[order.order_status] || STATUS_LABELS.pending_shipment;
                        
                        return (
                          <tr key={order._id} className="border-b hover:bg-zinc-50">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-zinc-400" />
                                <div>
                                  <p className="font-medium">{shipping.fullName || 'N/A'}</p>
                                  <p className="text-sm text-zinc-500">{shipping.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-sm">
                                <p>{shipping.address}</p>
                                <p className="text-zinc-500">{shipping.postalCode} {shipping.city}, {shipping.province}</p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <div className="text-sm">
                                <p className="font-medium">{order.quantity}x Dispositivo SOS</p>
                                <p className="text-zinc-500">Color: {order.color}</p>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              {isEditing ? (
                                <select 
                                  value={editForm.order_status}
                                  onChange={(e) => setEditForm({...editForm, order_status: e.target.value})}
                                  className="px-2 py-1 text-sm border rounded"
                                >
                                  {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                  ))}
                                </select>
                              ) : (
                                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                              )}
                            </td>
                            <td className="py-4 pr-4">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Input 
                                    placeholder="Nº seguimiento"
                                    value={editForm.tracking_number}
                                    onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                                    className="h-8 text-sm"
                                  />
                                  <select 
                                    value={editForm.carrier}
                                    onChange={(e) => setEditForm({...editForm, carrier: e.target.value})}
                                    className="w-full px-2 py-1 text-sm border rounded"
                                  >
                                    <option value="">Transportista</option>
                                    {carriers.map(c => (
                                      <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="text-sm">
                                  {order.tracking_number ? (
                                    <>
                                      <p className="font-mono">{order.tracking_number}</p>
                                      <p className="text-zinc-500">{carriers.find(c => c.id === order.carrier)?.name || order.carrier}</p>
                                    </>
                                  ) : (
                                    <span className="text-zinc-400">Sin asignar</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              {isEditing ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSaveOrder(order._id)}>
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingOrder(null)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditOrder(order)}>
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  {order.order_status === 'pending_shipment' && (
                                    <Button size="sm" onClick={() => handleQuickShip(order._id)}>
                                      <Truck className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Carriers Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Transportistas Disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {carriers.map(carrier => (
                  <div key={carrier.id} className="p-3 bg-zinc-50 rounded-lg">
                    <p className="font-medium">{carrier.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{carrier.tracking_url}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
