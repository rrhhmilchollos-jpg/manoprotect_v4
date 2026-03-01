// ManoProtect Desktop App - Main JavaScript

const API_BASE = 'https://mano-ops-workspace.preview.emergentagent.com';

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    navigateTo(page);
  });
});

function navigateTo(page) {
  // Handle external link
  if (page === 'web') {
    window.electronAPI.openExternal(API_BASE);
    return;
  }

  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
}

// Listen for navigation from tray
window.electronAPI.onNavigate((page) => {
  navigateTo(page);
});

// Logout
async function logout() {
  if (confirm('¿Seguro que quieres cerrar sesión?')) {
    await window.electronAPI.logout();
    window.location.reload();
  }
}

// Load providers
async function loadProviders() {
  try {
    const data = await window.electronAPI.apiCall({
      endpoint: '/api/security/providers',
      method: 'GET'
    });

    if (data.providers) {
      const list = document.getElementById('providers-list');
      list.innerHTML = data.providers.slice(0, 6).map(p => `
        <div class="provider-item">
          <div class="provider-icon" style="background: ${getProviderColor(p.name)}">${getProviderEmoji(p.name)}</div>
          <div class="provider-info">
            <span class="provider-name">${p.name}</span>
            <span class="provider-status">${p.status === 'active' ? '● Activo' : '○ Premium'}</span>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading providers:', error);
  }
}

function getProviderColor(name) {
  const colors = {
    'Google Safe Browsing': 'linear-gradient(135deg, #4285F4, #34A853)',
    'VirusTotal': 'linear-gradient(135deg, #3B82F6, #1E40AF)',
    'Cloudflare': 'linear-gradient(135deg, #F59E0B, #D97706)',
    'AbuseIPDB': 'linear-gradient(135deg, #EF4444, #B91C1C)',
    'AlienVault OTX': 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    'CrowdStrike Falcon': 'linear-gradient(135deg, #DC2626, #991B1B)'
  };
  return colors[name] || 'linear-gradient(135deg, #64748B, #475569)';
}

function getProviderEmoji(name) {
  const emojis = {
    'Google Safe Browsing': '🔍',
    'VirusTotal': '🛡️',
    'Cloudflare': '☁️',
    'AbuseIPDB': '🚫',
    'AlienVault OTX': '👽',
    'CrowdStrike Falcon': '🦅',
    'Recorded Future': '🔮',
    'Check Point': '✓'
  };
  return emojis[name] || '🔒';
}

// Load security grid
async function loadSecurityGrid() {
  try {
    const data = await window.electronAPI.apiCall({
      endpoint: '/api/security/providers',
      method: 'GET'
    });

    if (data.providers) {
      const grid = document.getElementById('security-grid');
      grid.innerHTML = data.providers.map(p => `
        <div class="security-card">
          <div class="security-card-header">
            <div class="security-card-icon" style="background: ${getProviderColor(p.name)}">${getProviderEmoji(p.name)}</div>
            <div>
              <div class="security-card-title">${p.name}</div>
              <div class="security-card-status">${p.status === 'active' ? '● Activo' : '○ ' + p.status}</div>
            </div>
          </div>
          <p class="security-card-desc">${p.description}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading security grid:', error);
  }
}

// URL Check
document.getElementById('url-check-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = document.getElementById('url-input').value;
  const resultDiv = document.getElementById('url-result');

  resultDiv.innerHTML = '<div class="spinner"></div> Analizando...';
  resultDiv.classList.remove('hidden', 'safe', 'danger', 'warning');

  try {
    const data = await window.electronAPI.apiCall({
      endpoint: '/api/security/check/url',
      method: 'POST',
      body: { url }
    });

    const isSafe = data.is_safe;
    const level = data.threat_level || 'unknown';

    resultDiv.classList.add(isSafe ? 'safe' : (level === 'critical' || level === 'high' ? 'danger' : 'warning'));

    resultDiv.innerHTML = `
      <div class="result-header">
        <div class="result-icon ${isSafe ? 'safe' : 'danger'}">
          ${isSafe ? '✓' : '⚠'}
        </div>
        <div>
          <div class="result-title">${isSafe ? 'URL Segura' : 'Posible Amenaza Detectada'}</div>
          <div class="result-subtitle">${data.url}</div>
        </div>
      </div>
      <div class="result-details">
        <div class="result-item">
          <span class="result-label">Nivel de Amenaza</span>
          <span class="result-value">${level.toUpperCase()}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Confianza</span>
          <span class="result-value">${data.confidence_score || 0}%</span>
        </div>
        <div class="result-item">
          <span class="result-label">Fuentes</span>
          <span class="result-value">${(data.sources || ['Análisis interno']).join(', ')}</span>
        </div>
        ${data.recommendations ? `
        <div class="result-item" style="flex-direction: column; gap: 8px;">
          <span class="result-label">Recomendaciones</span>
          <ul style="margin-left: 20px; color: var(--text-secondary);">
            ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: var(--accent-red);">Error: ${error.message}</p>`;
  }
});

// IP Check
document.getElementById('ip-check-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const ip = document.getElementById('ip-input').value;
  const resultDiv = document.getElementById('ip-result');

  resultDiv.innerHTML = '<div class="spinner"></div> Verificando...';
  resultDiv.classList.remove('hidden', 'safe', 'danger', 'warning');

  try {
    const data = await window.electronAPI.apiCall({
      endpoint: '/api/security/check/ip',
      method: 'POST',
      body: { ip }
    });

    const isSafe = data.is_safe;
    resultDiv.classList.add(isSafe ? 'safe' : 'danger');

    resultDiv.innerHTML = `
      <div class="result-header">
        <div class="result-icon ${isSafe ? 'safe' : 'danger'}">
          ${isSafe ? '✓' : '⚠'}
        </div>
        <div>
          <div class="result-title">${isSafe ? 'IP Sin Reportes' : 'IP Reportada'}</div>
          <div class="result-subtitle">${data.ip}</div>
        </div>
      </div>
      <div class="result-details">
        <div class="result-item">
          <span class="result-label">Nivel de Amenaza</span>
          <span class="result-value">${(data.threat_level || 'safe').toUpperCase()}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Puntuación</span>
          <span class="result-value">${data.confidence_score || 0}%</span>
        </div>
        <div class="result-item">
          <span class="result-label">Fuentes</span>
          <span class="result-value">${(data.sources || ['Análisis interno']).join(', ')}</span>
        </div>
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: var(--accent-red);">Error: ${error.message}</p>`;
  }
});

// Content Check
document.getElementById('content-check-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const content = document.getElementById('content-input').value;
  const resultDiv = document.getElementById('content-result');

  resultDiv.innerHTML = '<div class="spinner"></div> Analizando patrones...';
  resultDiv.classList.remove('hidden', 'safe', 'danger', 'warning');

  try {
    const data = await window.electronAPI.apiCall({
      endpoint: '/api/security/check/content',
      method: 'POST',
      body: { content }
    });

    const isScam = data.is_scam;
    resultDiv.classList.add(isScam ? 'danger' : 'safe');

    resultDiv.innerHTML = `
      <div class="result-header">
        <div class="result-icon ${isScam ? 'danger' : 'safe'}">
          ${isScam ? '⚠' : '✓'}
        </div>
        <div>
          <div class="result-title">${isScam ? 'Posible Estafa Detectada' : 'Sin Patrones Sospechosos'}</div>
          <div class="result-subtitle">Análisis de contenido</div>
        </div>
      </div>
      <div class="result-details">
        <div class="result-item">
          <span class="result-label">Nivel de Riesgo</span>
          <span class="result-value">${(data.threat_level || 'safe').toUpperCase()}</span>
        </div>
        <div class="result-item">
          <span class="result-label">Confianza</span>
          <span class="result-value">${data.overall_confidence || 0}%</span>
        </div>
        ${data.detected_patterns && data.detected_patterns.length > 0 ? `
        <div class="result-item" style="flex-direction: column; gap: 8px;">
          <span class="result-label">Patrones Detectados</span>
          <ul style="margin-left: 20px; color: var(--accent-red);">
            ${data.detected_patterns.map(p => `<li>${p.type}: ${p.confidence}% confianza</li>`).join('')}
          </ul>
        </div>
        ` : ''}
        ${data.recommendations ? `
        <div class="result-item" style="flex-direction: column; gap: 8px;">
          <span class="result-label">Recomendaciones</span>
          <ul style="margin-left: 20px; color: var(--text-secondary);">
            ${data.recommendations.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    resultDiv.innerHTML = `<p style="color: var(--accent-red);">Error: ${error.message}</p>`;
  }
});

// Platform info
document.getElementById('platform-info').textContent = window.electronAPI.platform;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProviders();
  loadSecurityGrid();
});
