// ManoProtect Shield - Content Script
// Runs on every page to provide real-time protection

const API_BASE = 'https://secure-gateway-33.preview.emergentagent.com/api';

// Create notification element
function createNotification(result, checkedValue) {
  // Remove existing notification
  const existing = document.getElementById('manoprotect-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'manoprotect-notification';
  notification.className = `manoprotect-notification ${result.is_safe ? 'safe' : 'danger'}`;
  
  const isSafe = result.is_safe;
  const riskScore = result.risk_score || 0;
  
  notification.innerHTML = `
    <div class="manoprotect-header">
      <div class="manoprotect-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7V12C3 16.97 6.84 21.5 12 22.5C17.16 21.5 21 16.97 21 12V7L12 2Z" 
                fill="${isSafe ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
          ${isSafe 
            ? '<path d="M9 12L11 14L15 10" stroke="white" stroke-width="2" stroke-linecap="round"/>'
            : '<path d="M12 8V12M12 16H12.01" stroke="white" stroke-width="2" stroke-linecap="round"/>'}
        </svg>
      </div>
      <span class="manoprotect-title">ManoProtect Shield</span>
      <button class="manoprotect-close" onclick="this.closest('#manoprotect-notification').remove()">×</button>
    </div>
    <div class="manoprotect-body">
      <div class="manoprotect-status ${isSafe ? 'safe' : 'danger'}">
        ${isSafe ? '✓ Sin Amenazas Detectadas' : '⚠️ ALERTA DE RIESGO'}
      </div>
      <div class="manoprotect-url">${checkedValue.substring(0, 50)}${checkedValue.length > 50 ? '...' : ''}</div>
      <div class="manoprotect-score">
        <span>Riesgo: ${riskScore}/100</span>
        <div class="manoprotect-bar">
          <div class="manoprotect-bar-fill" style="width: ${riskScore}%; background: ${
            riskScore >= 70 ? '#EF4444' : riskScore >= 40 ? '#F59E0B' : '#10B981'
          }"></div>
        </div>
      </div>
      ${result.recommendation ? `<div class="manoprotect-rec">${result.recommendation}</div>` : ''}
      ${result.warnings && result.warnings.length > 0 ? `
        <div class="manoprotect-warnings">
          ${result.warnings.slice(0, 2).map(w => `<div class="manoprotect-warning">⚠️ ${w}</div>`).join('')}
        </div>
      ` : ''}
    </div>
    <div class="manoprotect-footer">
      <a href="https://www.manoprotect.com/verificar-estafa" target="_blank">Mas detalles</a>
      <span class="manoprotect-live">🟢 APIs EN VIVO</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 10 seconds if safe
  if (isSafe) {
    setTimeout(() => notification.remove(), 10000);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'MANOPROTECT_RESULT') {
    createNotification(message.data, message.checkedValue);
  }
});

// Highlight suspicious links on page load
async function scanPageLinks() {
  const links = document.querySelectorAll('a[href]');
  const suspiciousPatterns = [
    /bit\.ly|tinyurl|t\.co/i,
    /login.*bank/i,
    /verify.*account/i,
    /paypal.*\.(?!com$)/i,
    /amazon.*\.(?!com$|es$)/i,
    /\.tk$|\.ml$|\.ga$/i
  ];
  
  links.forEach(link => {
    const href = link.href;
    const isSuspicious = suspiciousPatterns.some(p => p.test(href));
    
    if (isSuspicious) {
      link.classList.add('manoprotect-suspicious');
      link.title = 'ManoProtect: URL sospechosa - Haz clic derecho para verificar';
    }
  });
}

// Run scan when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scanPageLinks);
} else {
  scanPageLinks();
}
