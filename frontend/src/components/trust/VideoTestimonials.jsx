import React, { useState } from 'react';
import { Play, X, Quote, Star, CheckCircle } from 'lucide-react';

/**
 * Video Testimonials - Testimonios en video
 * Espacio para videos de clientes reales
 */
const VideoTestimonials = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  const videoTestimonials = [
    {
      id: 1,
      name: "María García",
      role: "Madre de familia",
      location: "Madrid",
      thumbnail: null, // Placeholder
      videoUrl: "#", // URL del video real
      duration: "2:34",
      quote: "ManoProtect salvó a mi madre de perder 3.000€ en una estafa telefónica",
      saved: "€3,000",
      verified: true
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Director Financiero",
      location: "Barcelona",
      thumbnail: null,
      videoUrl: "#",
      duration: "3:12",
      quote: "En mi empresa bloqueamos más de 50 intentos de phishing al mes",
      saved: "€15,000+",
      verified: true
    },
    {
      id: 3,
      name: "Ana Martínez",
      role: "Cuidadora",
      location: "Valencia",
      thumbnail: null,
      videoUrl: "#",
      duration: "1:58",
      quote: "Mis padres de 75 años ahora pueden usar el móvil sin miedo",
      saved: "Tranquilidad",
      verified: true
    }
  ];

  const handlePlayVideo = (video) => {
    setActiveVideo(video);
    // In production, this would open a video modal or embed
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            Testimonios en Video
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Escucha a Nuestros Clientes
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Historias reales de personas que han evitado estafas gracias a ManoProtect
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {videoTestimonials.map((video) => (
            <div 
              key={video.id}
              className="group bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-300 hover:shadow-xl transition-all"
            >
              {/* Video Thumbnail */}
              <div 
                className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 cursor-pointer"
                onClick={() => handlePlayVideo(video)}
              >
                {/* Placeholder for thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-500 group-hover:scale-110 transition-all">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <span className="text-white/80 text-sm">{video.duration}</span>
                  </div>
                </div>
                
                {/* Verified badge */}
                {video.verified && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verificado
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <Quote className="w-8 h-8 text-emerald-200 mb-2" />
                <p className="text-slate-700 font-medium mb-4 line-clamp-2">
                  "{video.quote}"
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{video.name}</p>
                    <p className="text-sm text-slate-500">{video.role} • {video.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Ahorró</p>
                    <p className="font-bold text-emerald-600">{video.saved}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-200">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                  <span className="text-sm text-slate-500 ml-2">5.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <p className="text-slate-600 mb-4">¿Quieres compartir tu historia?</p>
          <a 
            href="mailto:testimonios@manoprotect.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            <Play className="w-5 h-5" />
            Enviar Mi Testimonio
          </a>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative bg-black rounded-2xl overflow-hidden max-w-4xl w-full">
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Video placeholder */}
            <div className="aspect-video bg-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video de {activeVideo.name}</p>
                <p className="text-sm opacity-60">Próximamente disponible</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoTestimonials;
