import React from 'react';
import { Building2, Users, TrendingUp, Shield, Quote, ArrowRight } from 'lucide-react';

/**
 * Success Cases - Casos de éxito de empresas
 * Muestra empresas conocidas que usan ManoProtect
 */
const SuccessCases = () => {
  const cases = [
    {
      company: "Grupo Hospitales Valencia",
      industry: "Sanidad",
      logo: "GHV",
      color: "#0066cc",
      employees: "2,500+",
      result: "95% reducción en phishing",
      quote: "ManoProtect nos ha ayudado a proteger los datos de miles de pacientes y empleados.",
      author: "Director de IT",
      metrics: {
        threatsBlocked: "12,500+",
        savings: "€250,000",
        timeToDetect: "< 2 seg"
      }
    },
    {
      company: "Cadena Hoteles Costa",
      industry: "Hostelería",
      logo: "CHC",
      color: "#ff6600",
      employees: "1,200+",
      result: "100% empleados protegidos",
      quote: "Nuestro personal ya no cae en estafas de reservas falsas. La inversión se recuperó en 2 meses.",
      author: "CEO",
      metrics: {
        threatsBlocked: "3,400+",
        savings: "€85,000",
        timeToDetect: "< 3 seg"
      }
    },
    {
      company: "Bufete Abogados Martínez",
      industry: "Legal",
      logo: "BAM",
      color: "#1a1a1a",
      employees: "150+",
      result: "0 brechas de datos",
      quote: "La confidencialidad de nuestros clientes es sagrada. ManoProtect nos da esa tranquilidad.",
      author: "Socio Director",
      metrics: {
        threatsBlocked: "890+",
        savings: "€45,000",
        timeToDetect: "< 1 seg"
      }
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
            <Building2 className="w-4 h-4" />
            Casos de Éxito
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Empresas que Confían en Nosotros
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Desde startups hasta grandes corporaciones, ManoProtect protege a organizaciones de todos los tamaños
          </p>
        </div>

        {/* Cases Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {cases.map((caseItem, index) => (
            <div 
              key={index}
              className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden hover:border-emerald-500/50 transition-all group"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: caseItem.color }}
                  >
                    {caseItem.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{caseItem.company}</h3>
                    <p className="text-sm text-slate-400">{caseItem.industry} • {caseItem.employees} empleados</p>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  {caseItem.result}
                </div>
              </div>

              {/* Quote */}
              <div className="p-6 border-b border-slate-700">
                <Quote className="w-8 h-8 text-slate-700 mb-3" />
                <p className="text-slate-300 italic mb-3">"{caseItem.quote}"</p>
                <p className="text-sm text-slate-500">— {caseItem.author}</p>
              </div>

              {/* Metrics */}
              <div className="p-6 bg-slate-800/30">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Resultados</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{caseItem.metrics.threatsBlocked}</p>
                    <p className="text-xs text-slate-500">Amenazas bloqueadas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{caseItem.metrics.savings}</p>
                    <p className="text-xs text-slate-500">Ahorro estimado</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-400">{caseItem.metrics.timeToDetect}</p>
                    <p className="text-xs text-slate-500">Tiempo detección</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-slate-400 mb-4">¿Tu empresa necesita protección?</p>
          <a 
            href="/contact?type=enterprise"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
          >
            Solicitar Demo Empresarial
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default SuccessCases;
