import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Shield, Gem, Award } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

// Badge configurations
const BADGE_CONFIG = {
  'free': { 
    name: 'Bronce', 
    icon: Award, 
    color: 'bg-amber-700', 
    textColor: 'text-amber-100',
    gradient: 'from-amber-600 to-amber-800'
  },
  'personal': { 
    name: 'Plata', 
    icon: Shield, 
    color: 'bg-zinc-400', 
    textColor: 'text-zinc-900',
    gradient: 'from-zinc-300 to-zinc-500'
  },
  'personal-monthly': { 
    name: 'Plata', 
    icon: Shield, 
    color: 'bg-zinc-400', 
    textColor: 'text-zinc-900',
    gradient: 'from-zinc-300 to-zinc-500'
  },
  'personal-quarterly': { 
    name: 'Oro', 
    icon: Star, 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-900',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  'personal-yearly': { 
    name: 'Oro', 
    icon: Star, 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-900',
    gradient: 'from-yellow-400 to-yellow-600'
  },
  'family': { 
    name: 'Platino', 
    icon: Gem, 
    color: 'bg-cyan-200', 
    textColor: 'text-cyan-900',
    gradient: 'from-cyan-200 to-cyan-400'
  },
  'family-monthly': { 
    name: 'Platino', 
    icon: Gem, 
    color: 'bg-cyan-200', 
    textColor: 'text-cyan-900',
    gradient: 'from-cyan-200 to-cyan-400'
  },
  'family-quarterly': { 
    name: 'Platino', 
    icon: Gem, 
    color: 'bg-cyan-200', 
    textColor: 'text-cyan-900',
    gradient: 'from-cyan-200 to-cyan-400'
  },
  'family-yearly': { 
    name: 'Diamante', 
    icon: Gem, 
    color: 'bg-blue-300', 
    textColor: 'text-blue-900',
    gradient: 'from-blue-200 to-indigo-400'
  },
  'business': { 
    name: 'Diamante', 
    icon: Gem, 
    color: 'bg-blue-300', 
    textColor: 'text-blue-900',
    gradient: 'from-blue-200 to-indigo-400'
  },
  'enterprise': { 
    name: 'Élite', 
    icon: Crown, 
    color: 'bg-purple-600', 
    textColor: 'text-purple-100',
    gradient: 'from-purple-500 to-purple-800'
  },
};

const BADGE_EMOJI = {
  'free': '🥉',
  'personal': '🥈',
  'personal-monthly': '🥈',
  'personal-quarterly': '🥇',
  'personal-yearly': '🥇',
  'family': '💎',
  'family-monthly': '💎',
  'family-quarterly': '💎',
  'family-yearly': '💠',
  'business': '💠',
  'enterprise': '👑',
};

export const SubscriptionBadge = ({ plan, size = 'default', showName = true }) => {
  const config = BADGE_CONFIG[plan] || BADGE_CONFIG['free'];
  const emoji = BADGE_EMOJI[plan] || '🥉';
  const IconComponent = config.icon;
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };
  
  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${config.gradient} ${config.textColor} ${sizeClasses[size]} font-semibold shadow-md`}
      data-testid="subscription-badge"
    >
      <span className="text-base">{emoji}</span>
      {showName && <span>{config.name}</span>}
    </div>
  );
};

export const SubscriptionBadgeCard = ({ plan, userName }) => {
  const config = BADGE_CONFIG[plan] || BADGE_CONFIG['free'];
  const emoji = BADGE_EMOJI[plan] || '🥉';
  const IconComponent = config.icon;
  
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${config.gradient} p-6 text-center shadow-xl`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="text-6xl mb-3">{emoji}</div>
        <h3 className={`text-2xl font-bold ${config.textColor} mb-1`}>
          Nivel {config.name}
        </h3>
        <p className={`${config.textColor} opacity-80 text-sm`}>
          {userName || 'Usuario'}
        </p>
        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 ${config.textColor}`}>
          <IconComponent className="w-5 h-5" />
          <span className="font-medium capitalize">{plan.replace('-', ' ')}</span>
        </div>
      </div>
    </div>
  );
};

export const UserBadgeWithFetch = () => {
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadge = async () => {
      try {
        const response = await fetch(`${API}/user/badge`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setBadge(data);
        }
      } catch (error) {
        console.error('Error fetching badge:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadge();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-zinc-200 rounded-full h-8 w-24" />;
  }

  if (!badge) {
    return <SubscriptionBadge plan="free" />;
  }

  return <SubscriptionBadge plan={badge.plan} />;
};

export default SubscriptionBadge;
