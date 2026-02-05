/**
 * ManoProtect - Rewarded Ads System
 * Sistema de anuncios bonificados que otorgan recompensas
 */

window.ManoRewardedAds = {
  // Configuración de recompensas
  rewards: {
    // Ver anuncio = 1 día gratis de premium
    WATCH_AD_PREMIUM_DAY: {
      id: 'premium_day',
      name: '1 Día Premium Gratis',
      description: 'Mira un anuncio y obtén 1 día de funciones premium',
      icon: '👑',
      value: 1,
      unit: 'day'
    },
    
    // Ver anuncio = desbloquear zona extra
    WATCH_AD_EXTRA_ZONE: {
      id: 'extra_zone',
      name: 'Zona Segura Extra',
      description: 'Mira un anuncio y desbloquea 1 zona segura adicional',
      icon: '📍',
      value: 1,
      unit: 'zone'
    },
    
    // Ver anuncio = análisis de amenaza gratis
    WATCH_AD_THREAT_SCAN: {
      id: 'threat_scan',
      name: 'Análisis de Amenaza',
      description: 'Mira un anuncio y analiza 1 mensaje sospechoso',
      icon: '🔍',
      value: 1,
      unit: 'scan'
    }
  },
  
  // Estado actual
  state: {
    adLoaded: false,
    isShowing: false,
    dailyAdsWatched: 0,
    maxDailyAds: 5,
    lastReward: null
  },
  
  /**
   * Inicializar sistema de anuncios bonificados
   */
  init: function() {
    this._loadDailyCount();
    this._setupAdMobRewarded();
    console.log('[RewardedAds] System initialized');
  },
  
  /**
   * Cargar conteo diario de localStorage
   */
  _loadDailyCount: function() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('mano_rewarded_ads');
    
    if (stored) {
      const data = JSON.parse(stored);
      if (data.date === today) {
        this.state.dailyAdsWatched = data.count;
      } else {
        this._resetDailyCount();
      }
    }
  },
  
  /**
   * Resetear conteo diario
   */
  _resetDailyCount: function() {
    const today = new Date().toDateString();
    localStorage.setItem('mano_rewarded_ads', JSON.stringify({
      date: today,
      count: 0
    }));
    this.state.dailyAdsWatched = 0;
  },
  
  /**
   * Incrementar conteo de anuncios vistos
   */
  _incrementCount: function() {
    this.state.dailyAdsWatched++;
    const today = new Date().toDateString();
    localStorage.setItem('mano_rewarded_ads', JSON.stringify({
      date: today,
      count: this.state.dailyAdsWatched
    }));
  },
  
  /**
   * Configurar AdMob Rewarded (para app nativa)
   */
  _setupAdMobRewarded: function() {
    // Este código funciona en la app Android/iOS con AdMob SDK
    if (window.admob && window.admob.rewardVideo) {
      window.admob.rewardVideo.config({
        id: 'ca-app-pub-7713974112203810/XXXXXXXXXX', // ID de anuncio rewarded
        isTesting: true, // Cambiar a false en producción
        autoShow: false
      });
      
      window.admob.rewardVideo.prepare();
      this.state.adLoaded = true;
    }
  },
  
  /**
   * Verificar si puede ver más anuncios hoy
   */
  canWatchAd: function() {
    return this.state.dailyAdsWatched < this.state.maxDailyAds;
  },
  
  /**
   * Obtener anuncios restantes hoy
   */
  getRemainingAds: function() {
    return this.state.maxDailyAds - this.state.dailyAdsWatched;
  },
  
  /**
   * Mostrar anuncio bonificado
   * @param {string} rewardType - Tipo de recompensa
   * @param {function} onSuccess - Callback cuando se completa
   * @param {function} onError - Callback en caso de error
   */
  showRewardedAd: function(rewardType, onSuccess, onError) {
    const reward = this.rewards[rewardType];
    
    if (!reward) {
      console.error('[RewardedAds] Invalid reward type:', rewardType);
      if (onError) onError('Tipo de recompensa inválido');
      return;
    }
    
    if (!this.canWatchAd()) {
      console.log('[RewardedAds] Daily limit reached');
      if (onError) onError('Has alcanzado el límite diario de anuncios');
      return;
    }
    
    this.state.isShowing = true;
    
    // Para web, mostramos un modal de simulación
    // En app nativa, se usaría AdMob SDK
    this._showWebRewardedAd(reward, onSuccess, onError);
  },
  
  /**
   * Mostrar anuncio bonificado web (simulación/placeholder)
   */
  _showWebRewardedAd: function(reward, onSuccess, onError) {
    // Crear modal de anuncio
    const modal = document.createElement('div');
    modal.id = 'rewarded-ad-modal';
    modal.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.9);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div style="
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 20px;
          padding: 30px;
          max-width: 400px;
          text-align: center;
          color: white;
        ">
          <div style="font-size: 60px; margin-bottom: 15px;">${reward.icon}</div>
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">${reward.name}</h2>
          <p style="margin: 0 0 20px 0; opacity: 0.9;">${reward.description}</p>
          
          <div id="ad-countdown" style="
            font-size: 48px;
            font-weight: bold;
            margin: 20px 0;
          ">5</div>
          
          <p style="font-size: 14px; opacity: 0.7;">
            Anuncio de ejemplo • En la app real verás un video
          </p>
          
          <button id="ad-skip-btn" style="
            display: none;
            margin-top: 20px;
            background: white;
            color: #059669;
            border: none;
            padding: 12px 30px;
            border-radius: 10px;
            font-weight: bold;
            cursor: pointer;
            font-size: 16px;
          ">
            ¡Reclamar ${reward.name}!
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Countdown
    let countdown = 5;
    const countdownEl = document.getElementById('ad-countdown');
    const skipBtn = document.getElementById('ad-skip-btn');
    
    const timer = setInterval(() => {
      countdown--;
      if (countdownEl) countdownEl.textContent = countdown;
      
      if (countdown <= 0) {
        clearInterval(timer);
        if (skipBtn) skipBtn.style.display = 'inline-block';
      }
    }, 1000);
    
    // Handle claim
    skipBtn.addEventListener('click', () => {
      modal.remove();
      this.state.isShowing = false;
      this._incrementCount();
      this.state.lastReward = reward;
      
      // Otorgar recompensa
      this._grantReward(reward);
      
      if (onSuccess) onSuccess(reward);
      
      // Track en analytics
      if (window.ManoAds) {
        window.ManoAds.trackCustom('RewardedAdCompleted', {
          reward_type: reward.id,
          reward_name: reward.name
        });
      }
    });
  },
  
  /**
   * Otorgar recompensa al usuario
   */
  _grantReward: async function(reward) {
    const API_URL = window.REACT_APP_BACKEND_URL || '';
    
    try {
      const response = await fetch(`${API_URL}/api/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reward_id: reward.id,
          reward_value: reward.value,
          reward_unit: reward.unit
        })
      });
      
      const data = await response.json();
      console.log('[RewardedAds] Reward claimed:', data);
      
      // Mostrar notificación
      this._showRewardNotification(reward);
      
    } catch (error) {
      console.error('[RewardedAds] Error claiming reward:', error);
    }
  },
  
  /**
   * Mostrar notificación de recompensa
   */
  _showRewardNotification: function(reward) {
    // Usar toast si está disponible
    if (window.toast) {
      window.toast.success(`${reward.icon} ¡Has ganado ${reward.name}!`);
    } else {
      // Notificación simple
      const notif = document.createElement('div');
      notif.innerHTML = `
        <div style="
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 15px 25px;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          z-index: 99999;
          animation: slideIn 0.3s ease;
        ">
          ${reward.icon} ¡Has ganado ${reward.name}!
        </div>
      `;
      document.body.appendChild(notif);
      
      setTimeout(() => notif.remove(), 4000);
    }
  }
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  window.ManoRewardedAds.init();
});

console.log('[RewardedAds] System loaded');
