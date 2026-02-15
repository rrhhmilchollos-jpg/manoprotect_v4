/**
 * PaymentsSection Component - Payment Management with Stripe Integration
 */
import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, BarChart3, RefreshCw, Search, 
  FileText, CreditCard, Users, RotateCcw, AlertOctagon, Clock, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import StatCard from './StatCard';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const PaymentsSection = ({ employee, hasPermission }) => {
  const [summary, setSummary] = useState({});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stripe Payment Lookup & Refund State
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [paymentLogs, setPaymentLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  const canProcessRefunds = ['super_admin', 'admin', 'finance'].includes(employee?.role);
  const canViewPayments = ['super_admin', 'admin', 'finance', 'supervisor'].includes(employee?.role);

  useEffect(() => {
    fetchData();
    if (canViewPayments) {
      fetchPaymentLogs();
    }
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, paymentsRes] = await Promise.all([
        fetch(`${API_URL}/api/enterprise/payments/summary`, { credentials: 'include' }),
        fetch(`${API_URL}/api/enterprise/payments`, { credentials: 'include' })
      ]);
      
      if (summaryRes.ok) setSummary(await summaryRes.json());
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentLogs = async () => {
    try {
      const res = await fetch(`${API_URL}/api/enterprise/admin/payment-logs?limit=50`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPaymentLogs(data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaymentSearch = async () => {
    if (!searchId.trim()) {
      toast.error('Introduce un ID de pago válido');
      return;
    }
    
    setSearchLoading(true);
    setPaymentDetails(null);
    
    try {
      const res = await fetch(`${API_URL}/api/enterprise/admin/payments/${searchId.trim()}`, { credentials: 'include' });
      const data = await res.json();
      
      if (res.ok) {
        setPaymentDetails(data);
        toast.success('Pago encontrado');
      } else {
        toast.error(data.detail || 'Pago no encontrado');
      }
    } catch (err) {
      toast.error('Error al buscar pago');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim() || refundReason.length < 5) {
      toast.error('El motivo debe tener al menos 5 caracteres');
      return;
    }
    
    setRefundLoading(true);
    
    try {
      const body = { reason: refundReason };
      if (refundAmount && parseFloat(refundAmount) > 0) {
        body.amount = parseFloat(refundAmount);
      }
      
      const res = await fetch(`${API_URL}/api/enterprise/admin/payments/${paymentDetails.payment_id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Reembolso procesado correctamente');
        setShowRefundModal(false);
        setRefundReason('');
        setRefundAmount('');
        handlePaymentSearch();
        fetchPaymentLogs();
      } else {
        toast.error(data.detail || 'Error al procesar reembolso');
      }
    } catch (err) {
      toast.error('Error al procesar reembolso');
    } finally {
      setRefundLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="payments-section">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestión de Pagos</h1>
          <p className="text-slate-400">Administra pagos, reembolsos y flujo de caja</p>
        </div>
        <Button variant="outline" onClick={fetchData} className="border-slate-700 text-slate-300">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
          data-testid="tab-overview"
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Resumen
        </button>
        {canViewPayments && (
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'lookup' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            data-testid="tab-lookup"
          >
            <Search className="w-4 h-4 inline mr-2" />
            Buscar Pago
          </button>
        )}
        {canViewPayments && (
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
            data-testid="tab-logs"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Registro de Operaciones
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Ingresos Hoy"
              value={`€${(summary.today?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.today?.count || 0} transacciones`}
              icon={DollarSign}
              color="bg-emerald-600"
            />
            <StatCard
              title="Ingresos Semana"
              value={`€${(summary.week?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.week?.count || 0} transacciones`}
              icon={TrendingUp}
              color="bg-blue-600"
            />
            <StatCard
              title="Ingresos Mes"
              value={`€${(summary.month?.amount || 0).toFixed(2)}`}
              subtitle={`${summary.month?.count || 0} transacciones`}
              icon={BarChart3}
              color="bg-indigo-600"
            />
          </div>

          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white">Últimas Transacciones</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="text-left p-4 text-slate-400 font-medium">ID</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Cliente</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Plan</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Importe</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Estado</th>
                    <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-6 h-6 mx-auto animate-spin" />
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No hay transacciones
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, idx) => (
                      <tr key={payment.payment_id || idx} className="border-t border-slate-700 hover:bg-slate-800/50">
                        <td className="p-4 text-white font-mono text-xs">{payment.payment_id?.slice(0, 12) || '-'}</td>
                        <td className="p-4 text-slate-300">{payment.client_email || payment.email || '-'}</td>
                        <td className="p-4 text-slate-400">{payment.plan || '-'}</td>
                        <td className="p-4 text-emerald-400 font-semibold">€{(payment.amount || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <Badge className={payment.status === 'completed' ? 'bg-emerald-600' : 'bg-yellow-600'}>
                            {payment.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-500 text-sm">
                          {payment.created_at ? new Date(payment.created_at).toLocaleDateString('es-ES') : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Payment Lookup Tab */}
      {activeTab === 'lookup' && canViewPayments && (
        <div className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                Buscar Pago en Stripe
              </CardTitle>
              <CardDescription className="text-slate-400">
                Introduce el ID del PaymentIntent o Charge de Stripe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="pi_xxxx... o ch_xxxx..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white flex-1"
                  data-testid="payment-search-input"
                />
                <Button 
                  onClick={handlePaymentSearch}
                  disabled={searchLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                  data-testid="payment-search-btn"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {paymentDetails && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-white">Detalles del Pago</CardTitle>
                  <CardDescription className="text-slate-400 font-mono text-xs mt-1">
                    {paymentDetails.payment_id}
                  </CardDescription>
                </div>
                <Badge className={paymentDetails.status === 'succeeded' ? 'bg-emerald-600' : 'bg-yellow-600'}>
                  {paymentDetails.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Importe</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      €{paymentDetails.amount_received?.toFixed(2) || paymentDetails.amount?.toFixed(2)}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.currency}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Reembolsado</p>
                    <p className="text-2xl font-bold text-red-400">
                      €{paymentDetails.total_refunded?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.refunds?.length || 0} reembolsos</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Reembolsable</p>
                    <p className="text-2xl font-bold text-blue-400">
                      €{paymentDetails.refundable_amount?.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.is_refundable ? 'Disponible' : 'No disponible'}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-400 text-xs uppercase">Método</p>
                    <p className="text-xl font-bold text-white capitalize">
                      {paymentDetails.payment_method || 'card'}
                    </p>
                    <p className="text-slate-500 text-xs">{paymentDetails.payment_type}</p>
                  </div>
                </div>

                {paymentDetails.customer && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Información del Cliente
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Email</p>
                        <p className="text-white">{paymentDetails.customer.email || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Nombre</p>
                        <p className="text-white">{paymentDetails.customer.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Teléfono</p>
                        <p className="text-white">{paymentDetails.customer.phone || '-'}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">ID Cliente</p>
                        <p className="text-white font-mono text-xs">{paymentDetails.customer.id || '-'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentDetails.metadata && Object.keys(paymentDetails.metadata).length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Metadatos
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {Object.entries(paymentDetails.metadata).map(([key, value]) => (
                        <div key={key} className="bg-slate-800 rounded p-2">
                          <p className="text-slate-400 text-xs">{key}</p>
                          <p className="text-white break-all">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paymentDetails.refunds && paymentDetails.refunds.length > 0 && (
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-red-400" />
                      Historial de Reembolsos
                    </h4>
                    <div className="space-y-2">
                      {paymentDetails.refunds.map((refund, idx) => (
                        <div key={refund.refund_id || idx} className="flex items-center justify-between bg-slate-800 rounded p-3">
                          <div>
                            <p className="text-white font-mono text-xs">{refund.refund_id}</p>
                            <p className="text-slate-400 text-xs">
                              {refund.created ? new Date(refund.created).toLocaleString('es-ES') : '-'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-semibold">-€{refund.amount?.toFixed(2)}</p>
                            <Badge variant="outline" className="text-xs">
                              {refund.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canProcessRefunds && paymentDetails.is_refundable && (
                  <div className="flex justify-end">
                    <Button
                      onClick={() => setShowRefundModal(true)}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="process-refund-btn"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Procesar Reembolso
                    </Button>
                  </div>
                )}

                {!paymentDetails.is_refundable && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-center gap-3">
                    <AlertOctagon className="w-5 h-5 text-yellow-500" />
                    <p className="text-yellow-200 text-sm">
                      Este pago no es reembolsable. {paymentDetails.total_refunded > 0 ? 'Ya ha sido reembolsado completamente.' : 'El estado del pago no permite reembolsos.'}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Clock className="w-4 h-4" />
                  Creado: {paymentDetails.created ? new Date(paymentDetails.created).toLocaleString('es-ES') : '-'}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment Logs Tab */}
      {activeTab === 'logs' && canViewPayments && (
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Registro de Operaciones de Pagos
            </CardTitle>
            <CardDescription className="text-slate-400">
              Historial de consultas y reembolsos procesados
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="text-left p-4 text-slate-400 font-medium">Fecha</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Acción</th>
                  <th className="text-left p-4 text-slate-400 font-medium">ID Pago</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Importe</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Empleado</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {paymentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No hay registros de operaciones
                    </td>
                  </tr>
                ) : (
                  paymentLogs.map((log, idx) => (
                    <tr key={log.log_id || idx} className="border-t border-slate-700 hover:bg-slate-800/50">
                      <td className="p-4 text-slate-300 text-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString('es-ES') : '-'}
                      </td>
                      <td className="p-4">
                        <Badge className={log.action === 'refund' ? 'bg-red-600' : 'bg-blue-600'}>
                          {log.action === 'refund' ? 'Reembolso' : 'Consulta'}
                        </Badge>
                      </td>
                      <td className="p-4 text-white font-mono text-xs">{log.payment_id?.slice(0, 15) || '-'}</td>
                      <td className="p-4">
                        {log.action === 'refund' ? (
                          <span className="text-red-400 font-semibold">-€{log.refund_amount?.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{log.employee_name || '-'}</td>
                      <td className="p-4 text-slate-400 text-sm max-w-xs truncate">{log.reason || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Refund Confirmation Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" data-testid="refund-modal">
          <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-500" />
                Confirmar Reembolso
              </CardTitle>
              <CardDescription className="text-slate-400">
                Esta acción no se puede deshacer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Pago original</p>
                <p className="text-white font-mono text-sm">{paymentDetails?.payment_id}</p>
                <p className="text-emerald-400 text-lg font-bold mt-1">
                  €{paymentDetails?.amount_received?.toFixed(2)}
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Máximo reembolsable: €{paymentDetails?.refundable_amount?.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-2">
                  Importe a reembolsar (opcional, dejar vacío para reembolso total)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={paymentDetails?.refundable_amount}
                  placeholder={`Máx: €${paymentDetails?.refundable_amount?.toFixed(2)}`}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="bg-slate-900 border-slate-600 text-white"
                  data-testid="refund-amount-input"
                />
              </div>

              <div>
                <label className="text-slate-300 text-sm block mb-2">
                  Motivo del reembolso <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Describe el motivo del reembolso (mínimo 5 caracteres)"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-white placeholder-slate-500 min-h-[100px]"
                  data-testid="refund-reason-input"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundReason('');
                    setRefundAmount('');
                  }}
                  className="flex-1 border-slate-600 text-slate-300"
                  disabled={refundLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={refundLoading || refundReason.length < 5}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  data-testid="confirm-refund-btn"
                >
                  {refundLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <RotateCcw className="w-4 h-4 mr-2" />
                  )}
                  Confirmar Reembolso
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PaymentsSection;
