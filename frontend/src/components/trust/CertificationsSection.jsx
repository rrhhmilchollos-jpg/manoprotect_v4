import React from 'react';
import { Shield, Award, CheckCircle, Building2, Lock, FileCheck } from 'lucide-react';

/**
 * Certifications Section - Certificaciones y sellos oficiales
 * Muestra acreditaciones que generan confianza institucional
 */
const CertificationsSection = () => {
  const certifications = [
    {
      name: "ISO 27001",
      subtitle: "Seguridad de la Información",
      description: "Certificación internacional de gestión de seguridad",
      icon: Shield,
      color: "blue",
      year: "2024"
    },
    {
      name: "INCIBE",
      subtitle: "Instituto Nacional de Ciberseguridad",
      description: "Reconocido por el Instituto Nacional de Ciberseguridad de España",
      icon: Building2,
      color: "emerald",
      year: "2024"
    },
    {
      name: "AEPD",
      subtitle: "Agencia Española Protección Datos",
      description: "Cumplimiento total con la normativa RGPD/LOPD",
      icon: Lock,
      color: "purple",
      year: "2024"
    },
    {
      name: "ENS",
      subtitle: "Esquema Nacional de Seguridad",
      description: "Certificación de seguridad para servicios digitales",
      icon: FileCheck,
      color: "amber",
      year: "2024"
    }
  ];

  const awards = [
    {
      name: "Mejor App de Seguridad 2024",
      organization: "Premios Expansión",
      icon: "🏆"
    },
    {
      name: "Innovación Fintech",
      organization: "Spain Startup Awards",
      icon: "🚀"
    },
    {
      name: "Top 10 Ciberseguridad",
      organization: "El Referente",
      icon: "⭐"
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    amber: 'bg-amber-100 text-amber-600 border-amber-200',
  };

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
            <CheckCircle className="w-4 h-4" />
            Certificaciones Oficiales
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Seguridad Certificada y Reconocida
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            ManoProtect cumple con los más altos estándares de seguridad y está avalado por las principales instituciones de España
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {certifications.map((cert, index) => {
            const Icon = cert.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all group"
              >
                <div className={`w-14 h-14 rounded-xl ${colorClasses[cert.color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900">{cert.name}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{cert.year}</span>
                </div>
                <p className="text-sm text-emerald-600 font-medium mb-2">{cert.subtitle}</p>
                <p className="text-sm text-slate-500">{cert.description}</p>
              </div>
            );
          })}
        </div>

        {/* Awards */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Award className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">Premios y Reconocimientos</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {awards.map((award, index) => (
              <div 
                key={index}
                className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100"
              >
                <span className="text-4xl mb-3 block">{award.icon}</span>
                <p className="font-semibold text-slate-800 mb-1">{award.name}</p>
                <p className="text-sm text-slate-500">{award.organization}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust statement */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            <Lock className="w-4 h-4 inline mr-1" />
            Todos nuestros datos están cifrados y protegidos según la normativa europea RGPD
          </p>
        </div>
      </div>
    </section>
  );
};

export default CertificationsSection;
