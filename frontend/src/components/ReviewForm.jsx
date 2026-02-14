/**
 * ManoProtect - Review Form Component
 * Allows logged-in users to submit and edit their review
 */
import { useState, useEffect } from 'react';
import { Star, Send, Loader2, Check, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const ReviewForm = ({ onReviewSubmitted }) => {
  const [existingReview, setExistingReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchExistingReview();
  }, []);

  const fetchExistingReview = async () => {
    try {
      const res = await fetch(`${API_URL}/api/reviews/my-review`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.review) {
          setExistingReview(data.review);
          setRating(data.review.rating);
          setTitle(data.review.title || '');
          setComment(data.review.comment || '');
        }
      }
    } catch (err) {
      console.error('Error fetching review:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Por favor, selecciona una valoración');
      return;
    }
    
    if (comment.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres');
      return;
    }

    setSubmitting(true);

    try {
      const method = existingReview ? 'PUT' : 'POST';
      const endpoint = existingReview ? '/api/reviews/my-review' : '/api/reviews';
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rating,
          title: title.trim() || null,
          comment: comment.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || '¡Gracias por tu valoración!');
        setExistingReview(data.review || { rating, title, comment, status: 'pending' });
        setIsEditing(false);
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        toast.error(data.detail || 'Error al enviar valoración');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar tu valoración?')) return;

    setDeleting(true);

    try {
      const res = await fetch(`${API_URL}/api/reviews/my-review`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        toast.success('Valoración eliminada');
        setExistingReview(null);
        setRating(0);
        setTitle('');
        setComment('');
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Error al eliminar');
      }
    } catch (err) {
      toast.error('Error de conexión');
    } finally {
      setDeleting(false);
    }
  };

  const getRatingText = (stars) => {
    const texts = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    };
    return texts[stars] || '';
  };

  const getStatusBadge = (status) => {
    const badges = {
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Publicada' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente de revisión' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazada' }
    };
    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Show existing review in view mode
  if (existingReview && !isEditing) {
    const status = getStatusBadge(existingReview.status);
    
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6" data-testid="existing-review">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Tu valoración</h3>
            <span className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Editar"
              data-testid="edit-review-btn"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Eliminar"
              data-testid="delete-review-btn"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= existingReview.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-slate-600">
            {getRatingText(existingReview.rating)}
          </span>
        </div>

        {existingReview.title && (
          <h4 className="font-medium text-slate-900 mb-2">{existingReview.title}</h4>
        )}
        
        <p className="text-slate-600 text-sm leading-relaxed">
          "{existingReview.comment}"
        </p>

        {existingReview.status === 'rejected' && existingReview.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg text-sm text-red-700">
            <strong>Motivo del rechazo:</strong> {existingReview.rejection_reason}
          </div>
        )}
      </div>
    );
  }

  // Show form for creating/editing review
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6" data-testid="review-form">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-900">
          {existingReview ? 'Editar valoración' : 'Deja tu valoración'}
        </h3>
        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setRating(existingReview.rating);
              setTitle(existingReview.title || '');
              setComment(existingReview.comment || '');
            }}
            className="text-sm text-slate-500 hover:text-slate-700"
            data-testid="cancel-edit-btn"
          >
            Cancelar
          </button>
        )}
      </div>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ¿Cómo valorarías ManoProtect? *
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
              data-testid={`star-${star}`}
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200 hover:text-yellow-300'
                }`}
              />
            </button>
          ))}
          {(hoverRating || rating) > 0 && (
            <span className="ml-3 text-sm font-medium text-slate-600">
              {getRatingText(hoverRating || rating)}
            </span>
          )}
        </div>
      </div>

      {/* Title (optional) */}
      <div className="mb-4">
        <label htmlFor="review-title" className="block text-sm font-medium text-slate-700 mb-1">
          Título (opcional)
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Excelente protección para toda la familia"
          maxLength={100}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          data-testid="review-title-input"
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-1">
          Tu experiencia * <span className="text-slate-400 font-normal">(mín. 10 caracteres)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia con ManoProtect. ¿Qué es lo que más te gusta? ¿Cómo te ha ayudado?"
          minLength={10}
          maxLength={1000}
          rows={4}
          required
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
          data-testid="review-comment-input"
        />
        <div className="text-right text-xs text-slate-400 mt-1">
          {comment.length}/1000
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting || rating === 0 || comment.trim().length < 10}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="submit-review-btn"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            {existingReview ? 'Actualizar valoración' : 'Enviar valoración'}
          </>
        )}
      </button>

      {/* Info text */}
      <p className="text-xs text-slate-500 text-center mt-4">
        Tu valoración será revisada antes de publicarse. Los usuarios premium obtienen el badge de "Verificado".
      </p>
    </form>
  );
};

export default ReviewForm;
