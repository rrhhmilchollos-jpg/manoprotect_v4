/**
 * ClientDetailModal Component - User Details Modal
 */
import { X, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ClientDetailModal = ({ client, details, loading, onClose }) => {
  const planLabels = {
    free: 'Gratuito',
    'family-monthly': 'Familiar Mensual',
    'family-yearly': 'Familiar Anual',
    premium: 'Premium',
    enterprise: 'Empresarial'
  };

  const planColors = {
    free: 'bg-slate-600',
    'family-monthly': 'bg-emerald-600',
    'family-yearly': 'bg-emerald-600',
    premium: 'bg-indigo-600',
    enterprise: 'bg-purple-600'
  };

  const paymentStatusConfig = {
    completed: { label: 'Completado', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    paid: { label: 'Pagado', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    succeeded: { label: 'Exitoso', color: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-400' },
    pending: { label: 'Pendiente', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
    pending_payment: { label: 'Pago Pendiente', color: 'bg-yellow-500/20 text-yellow-400', dot: 'bg-yellow-400' },
    processing: { label: 'Procesando', color: 'bg-blue-500/20 text-blue-400', dot: 'bg-blue-400' },
    failed: { label: 'Fallido', color: 'bg-red-500/20 text-red-400', dot: 'bg-red-400' },
    refunded: { label: 'Reembolsado', color: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400' },
    cancelled: { label: 'Cancelado', color: 'bg-slate-500/20 text-slate-400', dot: 'bg-slate-400' },
    unknown: { label: 'Desconocido', color: 'bg-slate-500/20 text-slate-400', dot: 'bg-slate-400' }
  };

  const getPaymentStatus = (status) => {
    const normalizedStatus = (status || 'unknown').toLowerCase();
    return paymentStatusConfig[normalizedStatus] || paymentStatusConfig.unknown;
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    if (!amount && amount !== 0) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" data-testid="client-detail-modal">
      <Card className="bg-slate-800 border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-700 shrink-0">
          <CardTitle className="text-white">Detalles del Usuario</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-slate-400 hover:text-white" data-testid="close-modal-btn">
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
              <span className="ml-3 text-slate-400">Cargando información...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información del Usuario */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-2xl font-bold">
                    {(details?.name || client.name)?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate" data-testid="client-name">
                    {details?.name || client?.name || 'Sin nombre'}
                  </h3>
                  <p className="text-slate-400 truncate" data-testid="client-email">{details?.email || client?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`${planColors[details?.plan || client.plan] || planColors.free} text-white`}>
                      {planLabels[details?.plan || client.plan] || 'Gratuito'}
                    </Badge>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      (details?.subscription_status || client.subscription_status) === 'active' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : (details?.is_trial || client.is_trial) 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {(details?.is_trial || client.is_trial) ? 'Prueba' : 
                       (details?.subscription_status || client.subscription_status) === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Estadísticas del Usuario */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.sos_events_count || 0}</p>
                  <p className="text-slate-500 text-sm">Eventos SOS</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.alerts_count || 0}</p>
                  <p className="text-slate-500 text-sm">Alertas</p>
                </div>
                <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-2xl font-bold text-white">{details?.total_payments || 0}</p>
                  <p className="text-slate-500 text-sm">Pagos</p>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-slate-500 text-sm">Teléfono</p>
                  <p className="text-white">{details?.phone || client.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Fecha de Registro</p>
                  <p className="text-white">{formatDate(details?.created_at || client.created_at)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Dispositivo SOS</p>
                  <p className="text-white">
                    {details?.device_order ? (
                      <span className="text-emerald-400">Solicitado</span>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">ID de Usuario</p>
                  <p className="text-white font-mono text-xs">{details?.user_id || client.user_id || '-'}</p>
                </div>
              </div>

              {/* Historial de Pagos */}
              <div className="pt-4 border-t border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Historial de Transacciones
                </h4>
                
                {(!details?.payment_history || details.payment_history.length === 0) ? (
                  <div className="text-center py-8 bg-slate-900/30 rounded-lg">
                    <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                    <p className="text-slate-500">No hay transacciones registradas</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {details.payment_history.map((payment, index) => {
                      const statusConfig = getPaymentStatus(payment.status);
                      return (
                        <div 
                          key={payment.payment_id || index} 
                          className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors"
                          data-testid={`payment-row-${index}`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium truncate">
                                {payment.plan || 'Pago'}
                              </p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-slate-500 text-xs mt-1">
                              {formatDate(payment.created_at)}
                              {payment.payment_id && (
                                <span className="ml-2 font-mono">
                                  #{payment.payment_id.slice(-8)}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className={`font-semibold ${
                              payment.status === 'completed' || payment.status === 'paid' || payment.status === 'succeeded'
                                ? 'text-emerald-400' 
                                : payment.status === 'pending' || payment.status === 'pending_payment'
                                  ? 'text-yellow-400'
                                  : 'text-slate-400'
                            }`}>
                              {formatCurrency(payment.amount, payment.currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetailModal;
