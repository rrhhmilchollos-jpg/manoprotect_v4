import React, { useState, useEffect } from 'react';
import { Users, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

/**
 * Live Stats Counter - Contadores animados de estadísticas
 * Muestra números en tiempo real de familias protegidas, amenazas bloqueadas, etc.
 */
const LiveStatsCounter = ({ variant = 'banner' }) => {
  const [stats, setStats] = useState({
    familiesProtected: 10234,
    threatsBlocked: 52847,
    moneySaved: 4250000,
    activeAlerts: 127
  });

  // Animate numbers on mount
  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        threatsBlocked: prev.threatsBlocked + Math.floor(Math.random() * 3),
        familiesProtected: prev.familiesProtected + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return num.toLocaleString('es-ES');
    }
    return num.toString();
  };

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span><strong>{formatNumber(stats.familiesProtected)}</strong> familias protegidas</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span><strong>{formatNumber(stats.threatsBlocked)}</strong> amenazas bloqueadas</span>
          </div>
          <div className="hidden md:block w-px h-4 bg-white/30" />
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span><strong>€{formatNumber(stats.moneySaved)}</strong> ahorrados</span>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={Users}
        value={formatNumber(stats.familiesProtected)}
        label="Familias Protegidas"
        color="emerald"
        suffix="+"
      />
      <StatCard 
        icon={Shield}
        value={formatNumber(stats.threatsBlocked)}
        label="Amenazas Bloqueadas"
        color="blue"
      />
      <StatCard 
        icon={TrendingUp}
        value={`€${formatNumber(stats.moneySaved)}`}
        label="Dinero Ahorrado"
        color="amber"
      />
      <StatCard 
        icon={AlertTriangle}
        value={stats.activeAlerts}
        label="Alertas Hoy"
        color="red"
        live
      />
    </div>
  );
};

const StatCard = ({ icon: Icon, value, label, color, suffix = '', live = false }) => {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-4 border relative overflow-hidden`}>
      {live && (
        <span className="absolute top-2 right-2 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
      )}
      <Icon className="w-6 h-6 mb-2" />
      <p className="text-2xl font-bold text-white">{value}{suffix}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
};

export default LiveStatsCounter;
