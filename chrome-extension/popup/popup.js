// ManoProtect Shield - Popup Script
const API_BASE = 'https://redesign-home-1.preview.emergentagent.com/api';

// DOM Elements
const currentUrlEl = document.getElementById('current-url');
const checkCurrentBtn = document.getElementById('check-current');
const quickCheckInput = document.getElementById('quick-check-input');
const quickCheckBtn = document.getElementById('quick-check-btn');
const resultSection = document.getElementById('result-section');
const resultStatus = document.getElementById('result-status');
const resultScore = document.getElementById('result-score');
const resultDetails = document.getElementById('result-details');
const statChecks = document.getElementById('stat-checks');
const statThreats = document.getElementById('stat-threats');

// Load stats from storage
function loadStats() {
  chrome.storage.local.get(['totalChecks', 'threatsBlocked'], (data) => {
    statChecks.textContent = data.totalChecks || 0;
    statThreats.textContent = data.threatsBlocked || 0;
  });
}

// Update stats
function updateStats(isThreat) {
  chrome.storage.local.get(['totalChecks', 'threatsBlocked'], (data) => {
    const newChecks = (data.totalChecks || 0) + 1;
    const newThreats = (data.threatsBlocked || 0) + (isThreat ? 1 : 0);
    
    chrome.storage.local.set({
      totalChecks: newChecks,
      threatsBlocked: newThreats
    });
    
    statChecks.textContent = newChecks;
    statThreats.textContent = newThreats;
  });
}

// Get current tab URL
function getCurrentTabUrl() {
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_URL' }, (response) => {
    if (response && response.url) {
      currentUrlEl.textContent = response.url;
      currentUrlEl.title = response.url;
    } else {
      currentUrlEl.textContent = 'No se pudo obtener la URL';
    }
  });
}

// Check URL
async function checkUrl(url) {
  try {
    const response = await fetch(`${API_BASE}/realtime/check/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    return { error: true, message: error.message };
  }
}

// Display result
function displayResult(result) {
  resultSection.classList.remove('hidden');
  
  const isSafe = result.is_safe;
  const riskScore = result.risk_score || 0;
  
  // Status
  if (isSafe) {
    resultStatus.textContent = '✓ Sin Amenazas Detectadas';
    resultStatus.className = 'result-status safe';
  } else if (riskScore >= 70) {
    resultStatus.textContent = '⚠️ ALTO RIESGO';
    resultStatus.className = 'result-status danger';
  } else {
    resultStatus.textContent = '⚡ Precaucion Recomendada';
    resultStatus.className = 'result-status warning';
  }
  
  // Score
  const scoreColor = riskScore >= 70 ? '#EF4444' : riskScore >= 40 ? '#F59E0B' : '#10B981';
  resultScore.innerHTML = `
    <span style="color: #94A3B8; font-size: 12px;">Puntuacion de Riesgo: ${riskScore}/100</span>
    <div class="score-bar">
      <div class="score-fill" style="width: ${riskScore}%; background: ${scoreColor};"></div>
    </div>
  `;
  
  // Details
  let detailsHtml = '';
  
  if (result.recommendation) {
    detailsHtml += `<p style="margin-bottom: 8px;">${result.recommendation}</p>`;
  }
  
  if (result.checks && result.checks.length > 0) {
    detailsHtml += '<div style="margin-top: 8px;">';
    result.checks.forEach(check => {
      const icon = check.status === 'OK' ? '✅' : check.status === 'DANGER' ? '❌' : '⚠️';
      detailsHtml += `<div style="font-size: 11px; margin-bottom: 4px;">${icon} ${check.source}</div>`;
    });
    detailsHtml += '</div>';
  }
  
  if (result.warnings && result.warnings.length > 0) {
    result.warnings.forEach(warning => {
      detailsHtml += `<div class="result-warning">⚠️ ${warning}</div>`;
    });
  }
  
  resultDetails.innerHTML = detailsHtml;
  
  // Update stats
  updateStats(!isSafe);
}

// Event: Check current page
checkCurrentBtn.addEventListener('click', async () => {
  const url = currentUrlEl.textContent;
  if (!url || url === 'Cargando...' || url === 'No se pudo obtener la URL') {
    return;
  }
  
  checkCurrentBtn.disabled = true;
  checkCurrentBtn.innerHTML = '<span class="btn-icon">⏳</span> Verificando...';
  
  const result = await checkUrl(url);
  displayResult(result);
  
  checkCurrentBtn.disabled = false;
  checkCurrentBtn.innerHTML = '<span class="btn-icon">🔍</span> Verificar esta pagina';
});

// Event: Quick check
quickCheckBtn.addEventListener('click', async () => {
  const value = quickCheckInput.value.trim();
  if (!value) return;
  
  quickCheckBtn.disabled = true;
  quickCheckBtn.textContent = '...';
  
  // Detect type
  let endpoint = '/realtime/check/url';
  let body = { url: value };
  
  if (value.includes('@')) {
    endpoint = '/realtime/check/email';
    body = { email: value };
  } else if (/^[\d\+\s\-]+$/.test(value)) {
    endpoint = '/realtime/check/phone';
    body = { phone: value, country_code: 'ES' };
  }
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const result = await response.json();
    displayResult(result);
  } catch (error) {
    resultSection.classList.remove('hidden');
    resultStatus.textContent = '❌ Error de conexion';
    resultStatus.className = 'result-status danger';
    resultDetails.textContent = error.message;
  }
  
  quickCheckBtn.disabled = false;
  quickCheckBtn.textContent = 'Verificar';
});

// Event: Enter key in input
quickCheckInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    quickCheckBtn.click();
  }
});

// Initialize
getCurrentTabUrl();
loadStats();
