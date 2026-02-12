/**
 * ManoProtect - Order Tracking Page
 * Panel de seguimiento de pedidos de dispositivos SOS
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Phone,
  ArrowLeft, RefreshCw, Box, Home, AlertCircle, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Order status steps
const ORDER_STEPS = [
  { id: 'pending', label: 'Pedido Recibido', icon: Clock, description: 'Tu pedido ha sido registrado' },
  { id: 'confirmed', label: 'Confirmado', icon: CheckCircle, description: 'Pedido confirmado y en preparación' },
  { id: 'preparing', label: 'Preparando', icon: Box, description: 'Empaquetando tu dispositivo' },
  { id: 'shipped', label: 'Enviado', icon: Truck, description: 'En camino a tu dirección' },
  { id: 'delivered', label: 'Entregado', icon: Home, description: '¡Disfruta tu dispositivo!' },
];

// Mock tracking data for demo
const MOCK_ORDERS = [
  {
    id: 'SOS-2024-001',
    status: 'shipped',
    created_at: '2024-12-15T10:30:00',
    updated_at: '2024-12-17T14:20:00',
    quantity: 2,
    colors: ['Rosa Coral', 'Azul Marino'],
    shipping: {
      fullName: 'María García',
      address: 'Calle Mayor 123, 3ºB',
      city: 'Madrid',
      postalCode: '28001',
      province: 'Madrid'
    },
    tracking_number: 'MRW123456789',
    carrier: 'MRW',
    estimated_delivery: '2024-12-19',
    history: [
      { date: '2024-12-15T10:30:00', status: 'pending', message: 'Pedido recibido' },
      { date: '2024-12-15T11:00:00', status: 'confirmed', message: 'Pago confirmado' },
      { date: '2024-12-16T09:00:00', status: 'preparing', message: 'Preparando envío en almacén' },
      { date: '2024-12-17T14:20:00', status: 'shipped', message: 'Enviado con MRW - Tracking: MRW123456789' },
    ]
  }
];

export default function OrderTracking() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/sos-devices/my-orders`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.orders && data.orders.length > 0) {
          setOrders(data.orders);
          setSelectedOrder(data.orders[0]);
        } else {
          // Use mock data for demo
          setOrders(MOCK_ORDERS);
          setSelectedOrder(MOCK_ORDERS[0]);
        }
      } else {
        // Use mock data for demo
        setOrders(MOCK_ORDERS);
        setSelectedOrder(MOCK_ORDERS[0]);
      }
    } catch (error) {
      // Use mock data for demo
      setOrders(MOCK_ORDERS);
      setSelectedOrder(MOCK_ORDERS[0]);
    } finally {
      setLoading(false);
    }
  };

  const searchOrder = async () => {
    if (!searchOrderId.trim()) {
      toast.error('Introduce un número de pedido');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/v1/sos-devices/track/${searchOrderId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        toast.success('Pedido encontrado');
      } else {
        // Check mock data
        const mockOrder = MOCK_ORDERS.find(o => o.id === searchOrderId || o.tracking_number === searchOrderId);
        if (mockOrder) {
          setSelectedOrder(mockOrder);
          toast.success('Pedido encontrado');
        } else {
          toast.error('Pedido no encontrado');
        }
      }
    } catch (error) {
      toast.error('Error al buscar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return ORDER_STEPS.findIndex(s => s.id === status);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Helmet>
        <title>Seguimiento de Pedido - ManoProtect</title>
        <meta name="description" content="Rastrea el estado de tu pedido de dispositivo SOS ManoProtect en tiempo real." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-teal-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Seguimiento de Pedido</h1>
                <p className="text-white/80">
                  Rastrea el estado de tu dispositivo SOS en tiempo real
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Search bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    placeholder="Buscar por número de pedido o tracking..."
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchOrder()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={searchOrder} disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {selectedOrder ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main tracking info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status card */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-emerald-600" />
                          Pedido {selectedOrder.id}
                        </CardTitle>
                        <CardDescription>
                          Actualizado: {formatDate(selectedOrder.updated_at)}
                        </CardDescription>
                      </div>
                      <Badge className={
                        selectedOrder.status === 'delivered' ? 'bg-emerald-500' :
                        selectedOrder.status === 'shipped' ? 'bg-blue-500' :
                        selectedOrder.status === 'preparing' ? 'bg-amber-500' :
                        'bg-zinc-500'
                      }>
                        {ORDER_STEPS.find(s => s.id === selectedOrder.status)?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Progress steps */}
                    <div className="relative">
                      <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-zinc-200" />
                      <div className="space-y-6">
                        {ORDER_STEPS.map((step, idx) => {
                          const currentIdx = getStepIndex(selectedOrder.status);
                          const isCompleted = idx <= currentIdx;
                          const isCurrent = idx === currentIdx;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.id} className="flex items-start gap-4 relative">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all ${
                                isCompleted 
                                  ? 'bg-emerald-500 text-white shadow-lg' 
                                  : 'bg-zinc-100 text-zinc-400'
                              } ${isCurrent ? 'ring-4 ring-emerald-200' : ''}`}>
                                <StepIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 pt-2">
                                <p className={`font-semibold ${isCompleted ? 'text-zinc-800' : 'text-zinc-400'}`}>
                                  {step.label}
                                </p>
                                <p className="text-sm text-zinc-500">{step.description}</p>
                                {isCurrent && selectedOrder.status === 'shipped' && selectedOrder.tracking_number && (
                                  <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                      <strong>Tracking:</strong> {selectedOrder.tracking_number}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                      Transportista: {selectedOrder.carrier}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Historial del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.history?.slice().reverse().map((event, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-lg">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-800">{event.message}</p>
                            <p className="text-xs text-zinc-500">{formatDate(event.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Delivery info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Dirección de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">{selectedOrder.shipping.fullName}</p>
                      <p className="text-zinc-600">{selectedOrder.shipping.address}</p>
                      <p className="text-zinc-600">
                        {selectedOrder.shipping.postalCode} {selectedOrder.shipping.city}
                      </p>
                      <p className="text-zinc-600">{selectedOrder.shipping.province}</p>
                    </div>
                    
                    {selectedOrder.estimated_delivery && (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-lg">
                        <p className="text-xs text-emerald-600 font-medium">Entrega Estimada</p>
                        <p className="text-lg font-bold text-emerald-700">
                          {new Date(selectedOrder.estimated_delivery).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                          })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Box className="w-4 h-4 text-emerald-600" />
                      Detalles del Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Cantidad</span>
                        <span className="font-medium">{selectedOrder.quantity} dispositivo(s)</span>
                      </div>
                      {selectedOrder.colors && (
                        <div className="text-sm">
                          <span className="text-zinc-500 block mb-1">Colores</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedOrder.colors.map((color, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-zinc-500">Total pagado</span>
                        <span className="font-bold text-emerald-600">4,95€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Help */}
                <Card className="bg-amber-50 border-amber-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">¿Necesitas ayuda?</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Si tienes algún problema con tu pedido, contacta con nuestro soporte.
                        </p>
                        <Button variant="outline" size="sm" className="mt-3 text-amber-700 border-amber-300">
                          <Phone className="w-4 h-4 mr-2" />
                          Contactar Soporte
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-zinc-600 mb-2">No hay pedidos</h3>
                <p className="text-zinc-500 mb-4">
                  Aún no has realizado ningún pedido de dispositivo SOS
                </p>
                <Button onClick={() => navigate('/sos-device-order')}>
                  Pedir mi Dispositivo SOS
                </Button>
              </CardContent>
            </Card>
          )}

          {/* My orders list */}
          {orders.length > 1 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Mis Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full p-3 rounded-lg flex items-center justify-between transition-all ${
                        selectedOrder?.id === order.id
                          ? 'bg-emerald-100 border-2 border-emerald-500'
                          : 'bg-zinc-50 hover:bg-zinc-100 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-emerald-600" />
                        <div className="text-left">
                          <p className="font-medium">{order.id}</p>
                          <p className="text-xs text-zinc-500">{order.quantity} dispositivo(s)</p>
                        </div>
                      </div>
                      <Badge className={
                        order.status === 'delivered' ? 'bg-emerald-500' :
                        order.status === 'shipped' ? 'bg-blue-500' :
                        'bg-amber-500'
                      }>
                        {ORDER_STEPS.find(s => s.id === order.status)?.label}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
