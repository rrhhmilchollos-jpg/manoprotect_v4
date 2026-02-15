/**
 * ReviewsSection Component - User Ratings Management
 */
import { useState, useEffect } from 'react';
import { Star, MessageSquare, RefreshCw, Download, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ReviewsSection = ({ employee, hasPermission }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [statusFilter, page]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`${API_URL}/api/reviews/admin/all?${params}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalPages(data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/stats`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}/approve`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración aprobada');
        fetchReviews();
        fetchStats();
      } else {
        toast.error('Error al aprobar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleReject = async (reviewId) => {
    const reason = window.prompt('Motivo del rechazo:');
    if (!reason || reason.length < 5) {
      toast.error('Debes indicar un motivo (mín. 5 caracteres)');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PATCH',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración rechazada');
        fetchReviews();
        fetchStats();
      } else {
        toast.error('Error al rechazar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Eliminar esta valoración permanentemente?')) return;
    
    try {
      const res = await fetch(`${API_URL}/api/reviews/admin/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        toast.success('Valoración eliminada');
        fetchReviews();
        fetchStats();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Aprobada' },
      pending: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pendiente' },
      rejected: { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rechazada' }
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6" data-testid="reviews-section">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Valoraciones de Usuarios</h1>
          <p className="text-slate-400">Gestiona las valoraciones de los clientes</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={async () => {
              const url = `${API_URL}/api/export/reviews/csv${statusFilter ? '?status=' + statusFilter : ''}`;
              const response = await fetch(url, { credentials: 'include' });
              if (response.ok) {
                const blob = await response.blob();
                const a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = 'valoraciones_manoprotect.csv';
                a.click();
                toast.success('Exportación completada');
              }
            }}
            variant="outline" 
            className="border-slate-600 text-slate-300"
            data-testid="export-reviews-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button 
            onClick={() => { fetchReviews(); fetchStats(); }} 
            variant="outline" 
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(stats.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <p className="text-2xl font-bold text-white">{stats.average_rating?.toFixed(1) || '0'}</p>
              <p className="text-xs text-slate-400">Media</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total_reviews || 0}</p>
              <p className="text-xs text-slate-400">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{stats.distribution?.five_stars || 0}</p>
              <p className="text-xs text-slate-400">5 estrellas</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.distribution?.four_stars || 0}</p>
              <p className="text-xs text-slate-400">4 estrellas</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">
                {(stats.distribution?.three_stars || 0) + (stats.distribution?.two_stars || 0) + (stats.distribution?.one_star || 0)}
              </p>
              <p className="text-xs text-slate-400">1-3 estrellas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2"
              data-testid="status-filter"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Valoraciones</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-400">Cargando...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay valoraciones {statusFilter && `con estado "${statusFilter}"`}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => {
                const status = getStatusBadge(review.status);
                return (
                  <div 
                    key={review.review_id}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                    data-testid={`review-item-${review.review_id}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* User info */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                            {review.user_initial || 'U'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{review.display_name || review.user_name}</p>
                            <p className="text-xs text-slate-400">
                              {review.user_email} • {review.user_plan_display || review.user_plan}
                            </p>
                          </div>
                          <Badge className={`ml-auto ${status.className}`}>
                            {status.label}
                          </Badge>
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1 mb-2">
                          {[1,2,3,4,5].map(i => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`} 
                            />
                          ))}
                          <span className="ml-2 text-sm text-slate-400">
                            {new Date(review.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        
                        {/* Title & Comment */}
                        {review.title && (
                          <h4 className="text-white font-medium mb-1">{review.title}</h4>
                        )}
                        <p className="text-slate-300 text-sm">"{review.comment}"</p>
                        
                        {/* Rejection reason */}
                        {review.status === 'rejected' && review.rejection_reason && (
                          <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
                            Motivo: {review.rejection_reason}
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {review.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review.review_id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              data-testid={`approve-${review.review_id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(review.review_id)}
                              className="border-red-500 text-red-400 hover:bg-red-500/20"
                              data-testid={`reject-${review.review_id}`}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                        {['super_admin', 'admin'].includes(employee?.role) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(review.review_id)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            data-testid={`delete-${review.review_id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                Anterior
              </Button>
              <span className="text-slate-400 text-sm">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300"
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsSection;
