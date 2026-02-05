import React from 'react';

/**
 * Media Logos Section - "Visto en medios"
 * Muestra logos de medios de comunicación para credibilidad
 */
const MediaLogos = ({ variant = 'default' }) => {
  const mediaOutlets = [
    { name: 'El País', logo: 'EP', color: '#1a1a1a' },
    { name: 'La Vanguardia', logo: 'LV', color: '#c41e3a' },
    { name: 'El Mundo', logo: 'EM', color: '#0066cc' },
    { name: 'Antena 3', logo: 'A3', color: '#ff6600' },
    { name: 'RTVE', logo: 'TVE', color: '#e4002b' },
    { name: 'Expansión', logo: 'EX', color: '#003366' },
    { name: 'Cinco Días', logo: '5D', color: '#ff9900' },
    { name: 'La Razón', logo: 'LR', color: '#1a1a1a' },
  ];

  if (variant === 'compact') {
    return (
      <div className="py-6 border-y border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-slate-500 mb-4">Visto en:</p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {mediaOutlets.slice(0, 5).map((media, index) => (
              <div 
                key={index}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title={media.name}
              >
                <span className="text-lg font-bold tracking-tight">{media.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
            Como se ha visto en
          </p>
          <h3 className="text-xl font-semibold text-slate-800">
            Medios que han hablado de ManoProtect
          </h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
          {mediaOutlets.map((media, index) => (
            <div 
              key={index}
              className="flex items-center justify-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group cursor-default"
              title={media.name}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 text-white font-bold text-sm"
                  style={{ backgroundColor: media.color }}
                >
                  {media.logo}
                </div>
                <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">
                  {media.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          * ManoProtect ha sido mencionado en estos medios como solución innovadora contra el fraude digital
        </p>
      </div>
    </section>
  );
};

export default MediaLogos;
