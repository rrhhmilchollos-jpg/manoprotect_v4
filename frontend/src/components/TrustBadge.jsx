/**
 * ManoProtect - Trust Badge Component
 * Badge visual del Sello de Confianza para mostrar en páginas de clientes
 */
import React, { useState, useEffect } from 'react';
import { Shield, Award, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

/**
 * ManoProtect Trust Badge - Muestra el sello de confianza verificable
 * @param {string} variant - 'full' | 'compact' | 'minimal' | 'floating'
 * @param {string} position - Para variant='floating': 'bottom-left' | 'bottom-right'
 * @param {boolean} showVerification - Mostrar badge de verificación en el footer
 */
const TrustBadge = ({ 
  variant = 'full', 
  position = 'bottom-right',
  showVerification = true,
  sealCode = null,
  className = ''
}) => {
  const [verified, setVerified] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    if (sealCode) {
      verifySeal();
    }
  }, [sealCode]);

  const verifySeal = async () => {
    if (!sealCode) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API}/api/shield/seal/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seal_code: sealCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        setVerified(data.valid);
        setBusinessInfo({
          name: data.business_name,
          tier: data.tier,
          trust_score: data.trust_score
        });
      }
    } catch (error) {
      console.error('Error verifying seal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Minimal badge for footer
  if (variant === 'minimal') {
    return (
      <a 
        href="https://www.manoprotect.com/shield" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-medium transition-colors ${className}`}
      >
        <Shield className="w-3.5 h-3.5" />
        Protegido por ManoProtect
      </a>
    );
  }

  // Compact badge
  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg shadow-lg ${className}`}>
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="text-white">
          <p className="text-xs font-bold">ManoProtect</p>
          <p className="text-[10px] opacity-90">Sitio Verificado</p>
        </div>
        <CheckCircle className="w-5 h-5 text-white" />
      </div>
    );
  }

  // Floating badge
  if (variant === 'floating') {
    const positionClasses = position === 'bottom-left' 
      ? 'bottom-4 left-4' 
      : 'bottom-4 right-4';

    return (
      <div className={`fixed ${positionClasses} z-50`}>
        <a
          href="https://www.manoprotect.com/shield"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-xl border border-zinc-200 hover:shadow-2xl transition-all hover:scale-105"
        >
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div className="pr-2">
            <p className="text-sm font-bold text-zinc-800">Sitio Protegido</p>
            <p className="text-xs text-zinc-500">Verificado por ManoProtect</p>
          </div>
          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
        </a>
      </div>
    );
  }

  // Full badge (default)
  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 shadow-lg overflow-hidden max-w-xs ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-white">
            <p className="text-lg font-bold">ManoProtect</p>
            <p className="text-sm opacity-90">Sello de Confianza</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="font-semibold text-zinc-800">Sitio Web Verificado</span>
            </div>
            
            {businessInfo && (
              <div className="bg-zinc-50 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-zinc-700">{businessInfo.name}</p>
                {businessInfo.trust_score && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-zinc-500">Puntuación de confianza:</span>
                    <span className="text-sm font-bold text-emerald-600">{businessInfo.trust_score}%</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-zinc-600">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Empresa verificada</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Protección anti-fraude activa</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-zinc-50 px-4 py-3 border-t border-zinc-200">
        <a 
          href="https://www.manoprotect.com/shield"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Verificar en ManoProtect
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

/**
 * Footer Trust Seal - Componente simplificado para el footer
 */
export const FooterTrustSeal = () => (
  <div className="flex items-center justify-center gap-4 py-4">
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
      <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-emerald-700">Protegido por</p>
        <p className="text-sm font-bold text-emerald-800">ManoProtect</p>
      </div>
      <CheckCircle className="w-5 h-5 text-emerald-500" />
    </div>
  </div>
);

/**
 * Inline Trust Seal - Para usar en línea con texto
 */
export const InlineTrustSeal = ({ size = 'sm' }) => {
  const sizeClasses = {
    xs: 'text-xs gap-1 px-2 py-0.5',
    sm: 'text-sm gap-1.5 px-2.5 py-1',
    md: 'text-base gap-2 px-3 py-1.5'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5'
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} bg-emerald-100 text-emerald-700 rounded-full font-medium`}>
      <Shield className={iconSizes[size]} />
      ManoProtect Verified
      <CheckCircle className={iconSizes[size]} />
    </span>
  );
};

export default TrustBadge;
