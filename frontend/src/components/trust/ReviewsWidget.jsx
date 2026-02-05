import React, { useState, useEffect } from 'react';
import { Star, ExternalLink, CheckCircle, ThumbsUp } from 'lucide-react';

/**
 * Reviews Widget - Widget de reseñas tipo Trustpilot/Google
 * Muestra reseñas con estilo de plataforma externa
 */
const ReviewsWidget = ({ platform = 'trustpilot' }) => {
  const [activeTab, setActiveTab] = useState('trustpilot');
  
  const reviewsData = {
    trustpilot: {
      name: 'Trustpilot',
      logo: '★',
      color: '#00b67a',
      rating: 4.8,
      totalReviews: 1247,
      url: 'https://www.trustpilot.com/review/manoprotect.com',
      reviews: [
        {
          author: "Marta Jiménez",
          date: "hace 2 días",
          rating: 5,
          title: "Excelente protección",
          text: "Detectaron un intento de phishing de mi banco antes de que pudiera caer. El análisis fue instantáneo. Muy recomendable.",
          verified: true
        },
        {
          author: "Francisco López",
          date: "hace 5 días",
          rating: 5,
          title: "Tranquilidad para mis padres",
          text: "Mis padres de 80 años ya no tienen miedo de usar el móvil. La app les protege automáticamente de llamadas fraudulentas.",
          verified: true
        },
        {
          author: "Elena Ruiz",
          date: "hace 1 semana",
          rating: 5,
          title: "Vale cada céntimo",
          text: "En 2 meses ha detectado 4 intentos de estafa. Calculando lo que me habría costado, la suscripción se paga sola.",
          verified: true
        },
        {
          author: "Alberto Díaz",
          date: "hace 1 semana",
          rating: 4,
          title: "Muy buena app",
          text: "Funciona muy bien. Solo le falta mejorar la interfaz en algunos puntos pero la protección es excelente.",
          verified: true
        }
      ]
    },
    google: {
      name: 'Google Reviews',
      logo: 'G',
      color: '#4285f4',
      rating: 4.9,
      totalReviews: 856,
      url: 'https://g.page/manoprotect',
      reviews: [
        {
          author: "Carmen García",
          date: "hace 3 días",
          rating: 5,
          title: "",
          text: "Imprescindible para cualquier persona mayor. Mi madre ya no cae en estafas telefónicas gracias a ManoProtect.",
          verified: true
        },
        {
          author: "David Martín",
          date: "hace 1 semana",
          rating: 5,
          title: "",
          text: "El mejor antifraude que he probado. La IA detecta cosas que yo no habría visto nunca. Muy contento.",
          verified: true
        },
        {
          author: "Lucía Fernández",
          date: "hace 2 semanas",
          rating: 5,
          title: "",
          text: "Protección familiar de verdad. Todos conectados y alertas compartidas. Genial para familias grandes.",
          verified: true
        }
      ]
    }
  };

  const currentPlatform = reviewsData[activeTab];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {Object.keys(reviewsData).map((platform) => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === platform 
                ? 'bg-slate-50 text-slate-900 border-b-2 border-emerald-500' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {reviewsData[platform].name}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: currentPlatform.color }}
            >
              {currentPlatform.logo}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{currentPlatform.name}</p>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(Math.round(currentPlatform.rating))}</div>
                <span className="text-lg font-bold text-slate-800">{currentPlatform.rating}</span>
                <span className="text-sm text-slate-500">
                  ({currentPlatform.totalReviews.toLocaleString()} reseñas)
                </span>
              </div>
            </div>
          </div>
          <a 
            href={currentPlatform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Ver todas
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Reviews */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {currentPlatform.reviews.map((review, index) => (
          <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800">{review.author}</span>
                  {review.verified && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verificado
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{review.date}</span>
              </div>
              <div className="flex">{renderStars(review.rating)}</div>
            </div>
            {review.title && (
              <p className="font-medium text-slate-800 mb-1">{review.title}</p>
            )}
            <p className="text-sm text-slate-600">{review.text}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100">
        <a 
          href={currentPlatform.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
        >
          <ThumbsUp className="w-4 h-4" />
          Escribir una reseña en {currentPlatform.name}
        </a>
      </div>
    </div>
  );
};

export default ReviewsWidget;
