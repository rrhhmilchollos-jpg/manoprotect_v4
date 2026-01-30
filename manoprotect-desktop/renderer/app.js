// ManoProtect Desktop - Main Application Logic
// =============================================

// State
let currentUser = null;
let currentSection = 'dashboard';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Sample data (in production, this would come from the database/API)
const sampleData = {
    threats: [
        { id: 'THR001', type: 'phishing', severity: 'critical', title: 'Phishing Banco Santander', description: 'Correo falso solicitando datos bancarios', source: 'email', status: 'pending', created_at: new Date().toISOString() },
        { id: 'THR002', type: 'smishing', severity: 'high', title: 'SMS Correos falso', description: 'SMS con enlace malicioso haciéndose pasar por Correos', source: 'sms', status: 'investigating', assigned_to: 'EMP002', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'THR003', type: 'vishing', severity: 'medium', title: 'Llamada Microsoft falsa', description: 'Llamada haciéndose pasar por soporte técnico de Microsoft', source: 'phone', status: 'resolved', created_at: new Date(Date.now() - 7200000).toISOString() },
        { id: 'THR004', type: 'phishing', severity: 'high', title: 'Email Amazon Prime', description: 'Correo sobre renovación falsa de Amazon Prime', source: 'email', status: 'pending', created_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 'THR005', type: 'smishing', severity: 'critical', title: 'SMS Hacienda', description: 'SMS falso de la Agencia Tributaria sobre devolución', source: 'sms', status: 'pending', created_at: new Date(Date.now() - 900000).toISOString() }
    ],
    tickets: [
        { id: 'TKT001', subject: 'No puedo acceder a mi cuenta', priority: 'high', status: 'open', client: 'Juan Pérez', created_at: new Date().toISOString() },
        { id: 'TKT002', subject: 'Pregunta sobre plan familiar', priority: 'medium', status: 'in_progress', client: 'Ana García', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'TKT003', subject: 'Solicitud de reembolso', priority: 'low', status: 'closed', client: 'Pedro López', created_at: new Date(Date.now() - 86400000).toISOString() }
    ],
    clients: [
        { id: 'CLI001', name: 'Juan Pérez García', email: 'juan@email.com', phone: '+34666111222', plan: 'premium', status: 'active', threats: 3 },
        { id: 'CLI002', name: 'María López Ruiz', email: 'maria@email.com', phone: '+34666333444', plan: 'family', status: 'active', threats: 1 },
        { id: 'CLI003', name: 'Carlos Martín Soto', email: 'carlos@email.com', phone: '+34666555666', plan: 'free', status: 'active', threats: 0 },
        { id: 'CLI004', name: 'Ana Fernández Gil', email: 'ana@email.com', phone: '+34666777888', plan: 'premium', status: 'inactive', threats: 5 },
        { id: 'CLI005', name: 'Empresa TechCorp SL', email: 'info@techcorp.es', phone: '+34911222333', plan: 'enterprise', status: 'active', threats: 12 }
    ],
    employees: [
        { id: 'EMP001', name: 'Administrador', email: 'admin@manoprotect.com', role: 'admin', branch: 'central', online: true },
        { id: 'EMP002', name: 'María García', email: 'maria@manoprotect.com', role: 'supervisor', branch: 'central', online: true },
        { id: 'EMP003', name: 'Carlos López', email: 'carlos@manoprotect.com', role: 'agent', branch: 'madrid', online: true },
        { id: 'EMP004', name: 'Ana Martínez', email: 'ana@manoprotect.com', role: 'agent', branch: 'barcelona', online: false },
        { id: 'EMP005', name: 'Pedro Sánchez', email: 'pedro@manoprotect.com', role: 'agent', branch: 'valencia', online: true }
    ],
    stats: {
        threatsToday: 15,
        ticketsOpen: 8,
        totalClients: 1250,
        scamsVerified: 3456
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Check for saved session
    const savedUser = localStorage.getItem('manoprotect_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    }
    
    // Event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Sidebar navigation
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            navigateToSection(section);
        });
    });
    
    // Threat filters
    document.querySelectorAll('.threat-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.threat-filter').forEach(b => b.classList.remove('bg-indigo-600'));
            e.target.classList.add('bg-indigo-600');
            filterThreats(e.target.dataset.filter);
        });
    });
    
    // Ticket filters
    document.querySelectorAll('.ticket-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.ticket-filter').forEach(b => {
                b.classList.remove('bg-indigo-600');
                b.classList.add('bg-gray-700');
            });
            e.target.classList.remove('bg-gray-700');
            e.target.classList.add('bg-indigo-600');
            filterTickets(e.target.dataset.filter);
        });
    });
    
    // Client search
    document.getElementById('client-search').addEventListener('input', (e) => {
        searchClients(e.target.value);
    });
    
    // Verify buttons
    document.getElementById('verify-analyze-btn').addEventListener('click', analyzeContent);
    document.getElementById('verify-add-btn').addEventListener('click', addToScamDatabase);
    
    // Chat send
    document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });
}

// Authentication
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (in production, this would check against the database)
    if (email === 'admin@manoprotect.com' && password === 'Admin2024!') {
        currentUser = {
            id: 'EMP001',
            name: 'Administrador',
            email: email,
            role: 'admin',
            branch: 'central'
        };
        localStorage.setItem('manoprotect_user', JSON.stringify(currentUser));
        showMainApp();
    } else if (email.endsWith('@manoprotect.com') && password === 'Mano2024!') {
        currentUser = {
            id: 'EMP003',
            name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
            email: email,
            role: 'agent',
            branch: 'central'
        };
        localStorage.setItem('manoprotect_user', JSON.stringify(currentUser));
        showMainApp();
    } else {
        loginError.textContent = 'Credenciales incorrectas';
        loginError.classList.remove('hidden');
    }
}

function handleLogout() {
    localStorage.removeItem('manoprotect_user');
    currentUser = null;
    loginScreen.classList.remove('hidden');
    mainApp.classList.add('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

function showMainApp() {
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Update user info
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = getRoleName(currentUser.role);
    document.getElementById('user-initials').textContent = getInitials(currentUser.name);
    
    // Load dashboard data
    loadDashboard();
}

// Navigation
function navigateToSection(section) {
    currentSection = section;
    
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.section-content').forEach(sec => {
        sec.classList.add('hidden');
    });
    document.getElementById(`section-${section}`).classList.remove('hidden');
    
    // Update header
    const titles = {
        dashboard: ['Dashboard', 'Resumen del día'],
        threats: ['Amenazas', 'Gestión de amenazas detectadas'],
        clients: ['Clientes', 'Base de datos de clientes'],
        verifier: ['Verificador', 'Analizar y verificar estafas'],
        tickets: ['Tickets', 'Centro de soporte'],
        chat: ['Chat Interno', 'Comunicación del equipo'],
        reports: ['Reportes', 'Métricas y estadísticas'],
        scams: ['Base de Estafas', 'Fraudes verificados']
    };
    
    document.getElementById('section-title').textContent = titles[section][0];
    document.getElementById('section-subtitle').textContent = titles[section][1];
    
    // Load section data
    switch(section) {
        case 'dashboard': loadDashboard(); break;
        case 'threats': loadThreats(); break;
        case 'clients': loadClients(); break;
        case 'tickets': loadTickets(); break;
        case 'reports': loadReports(); break;
    }
}

// Dashboard
function loadDashboard() {
    // Update stats
    document.getElementById('stat-threats').textContent = sampleData.stats.threatsToday;
    document.getElementById('stat-tickets').textContent = sampleData.stats.ticketsOpen;
    document.getElementById('stat-clients').textContent = sampleData.stats.totalClients.toLocaleString();
    document.getElementById('stat-scams').textContent = sampleData.stats.scamsVerified.toLocaleString();
    
    // Update badges
    const pendingThreats = sampleData.threats.filter(t => t.status === 'pending').length;
    const openTickets = sampleData.tickets.filter(t => t.status === 'open').length;
    document.getElementById('threats-badge').textContent = pendingThreats;
    document.getElementById('tickets-badge').textContent = openTickets;
    
    // Load recent threats
    const recentThreatsEl = document.getElementById('recent-threats');
    recentThreatsEl.innerHTML = sampleData.threats.slice(0, 5).map(threat => `
        <div class="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg threat-${threat.severity}">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityBg(threat.severity)}">
                <i class="fas ${getThreatIcon(threat.type)} ${getSeverityColor(threat.severity)}"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${threat.title}</p>
                <p class="text-xs text-gray-400">${getTimeAgo(threat.created_at)}</p>
            </div>
            <span class="status-badge status-${threat.status}">${getStatusName(threat.status)}</span>
        </div>
    `).join('');
    
    // Load recent tickets
    const recentTicketsEl = document.getElementById('recent-tickets');
    recentTicketsEl.innerHTML = sampleData.tickets.map(ticket => `
        <div class="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center ${getPriorityBg(ticket.priority)}">
                <i class="fas fa-ticket-alt ${getPriorityColor(ticket.priority)}"></i>
            </div>
            <div class="flex-1">
                <p class="text-sm font-medium">${ticket.subject}</p>
                <p class="text-xs text-gray-400">${ticket.client} · ${getTimeAgo(ticket.created_at)}</p>
            </div>
            <span class="status-badge status-${ticket.status}">${getStatusName(ticket.status)}</span>
        </div>
    `).join('');
    
    // Load online users
    const onlineUsersEl = document.getElementById('online-users');
    onlineUsersEl.innerHTML = sampleData.employees.filter(e => e.online).map(emp => `
        <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-700">
            <div class="relative">
                <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-semibold">
                    ${getInitials(emp.name)}
                </div>
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-800 rounded-full"></span>
            </div>
            <span class="text-sm">${emp.name}</span>
        </div>
    `).join('');
}

// Threats
function loadThreats(filter = 'all') {
    const threats = filter === 'all' 
        ? sampleData.threats 
        : sampleData.threats.filter(t => t.status === filter);
    
    const threatsListEl = document.getElementById('threats-list');
    threatsListEl.innerHTML = threats.map(threat => `
        <div class="bg-gray-800 rounded-xl border border-gray-700 p-4 threat-${threat.severity}">
            <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center ${getSeverityBg(threat.severity)}">
                        <i class="fas ${getThreatIcon(threat.type)} text-xl ${getSeverityColor(threat.severity)}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="status-badge ${getSeverityBadge(threat.severity)}">${threat.severity.toUpperCase()}</span>
                            <span class="text-xs text-gray-500">${threat.type}</span>
                            <span class="text-xs text-gray-500">· ${threat.id}</span>
                        </div>
                        <h4 class="font-semibold">${threat.title}</h4>
                        <p class="text-sm text-gray-400 mt-1">${threat.description}</p>
                        <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span><i class="fas fa-${threat.source === 'email' ? 'envelope' : threat.source === 'sms' ? 'sms' : 'phone'} mr-1"></i> ${threat.source}</span>
                            <span><i class="fas fa-clock mr-1"></i> ${getTimeAgo(threat.created_at)}</span>
                            ${threat.assigned_to ? `<span><i class="fas fa-user mr-1"></i> Asignado</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <span class="status-badge status-${threat.status}">${getStatusName(threat.status)}</span>
                    <div class="relative">
                        <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
            </div>
            ${threat.status === 'pending' ? `
            <div class="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button onclick="assignThreat('${threat.id}')" class="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm">
                    <i class="fas fa-user-plus mr-1"></i> Asignarme
                </button>
                <button onclick="resolveThreat('${threat.id}')" class="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm">
                    <i class="fas fa-check mr-1"></i> Resolver
                </button>
                <button class="px-4 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-sm">
                    <i class="fas fa-flag mr-1"></i> Escalar
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

function filterThreats(filter) {
    loadThreats(filter);
}

function assignThreat(threatId) {
    const threat = sampleData.threats.find(t => t.id === threatId);
    if (threat) {
        threat.status = 'investigating';
        threat.assigned_to = currentUser.id;
        loadThreats();
        showNotification('Amenaza asignada correctamente', 'success');
    }
}

function resolveThreat(threatId) {
    const threat = sampleData.threats.find(t => t.id === threatId);
    if (threat) {
        threat.status = 'resolved';
        threat.resolved_by = currentUser.id;
        threat.resolved_at = new Date().toISOString();
        loadThreats();
        showNotification('Amenaza marcada como resuelta', 'success');
    }
}

// Clients
function loadClients() {
    renderClients(sampleData.clients);
}

function renderClients(clients) {
    const tbody = document.getElementById('clients-table-body');
    tbody.innerHTML = clients.map(client => `
        <tr class="hover:bg-gray-700/50">
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-semibold">
                        ${getInitials(client.name)}
                    </div>
                    <div>
                        <p class="font-medium">${client.name}</p>
                        <p class="text-xs text-gray-400">${client.id}</p>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 text-sm">${client.email}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs font-semibold ${getPlanBadge(client.plan)}">${client.plan.toUpperCase()}</span>
            </td>
            <td class="px-4 py-3 text-sm">${client.threats}</td>
            <td class="px-4 py-3">
                <span class="w-2 h-2 inline-block rounded-full ${client.status === 'active' ? 'bg-green-500' : 'bg-gray-500'} mr-1"></span>
                <span class="text-sm">${client.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            </td>
            <td class="px-4 py-3">
                <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg" onclick="viewClient('${client.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchClients(query) {
    if (!query) {
        renderClients(sampleData.clients);
        return;
    }
    const filtered = sampleData.clients.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.email.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query)
    );
    renderClients(filtered);
}

// Tickets
function loadTickets(filter = 'all') {
    const tickets = filter === 'all' 
        ? sampleData.tickets 
        : sampleData.tickets.filter(t => t.status === filter);
    
    const ticketsListEl = document.getElementById('tickets-list');
    ticketsListEl.innerHTML = tickets.map(ticket => `
        <div class="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <div class="flex items-start justify-between">
                <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center ${getPriorityBg(ticket.priority)}">
                        <i class="fas fa-ticket-alt text-xl ${getPriorityColor(ticket.priority)}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs text-gray-500">${ticket.id}</span>
                            <span class="status-badge ${getPriorityBadgeClass(ticket.priority)}">${ticket.priority.toUpperCase()}</span>
                        </div>
                        <h4 class="font-semibold">${ticket.subject}</h4>
                        <p class="text-sm text-gray-400 mt-1">Cliente: ${ticket.client}</p>
                        <p class="text-xs text-gray-500 mt-2"><i class="fas fa-clock mr-1"></i> ${getTimeAgo(ticket.created_at)}</p>
                    </div>
                </div>
                <span class="status-badge status-${ticket.status}">${getStatusName(ticket.status)}</span>
            </div>
        </div>
    `).join('');
}

function filterTickets(filter) {
    loadTickets(filter);
}

// Verifier
function analyzeContent() {
    const content = document.getElementById('verify-content').value;
    if (!content) {
        showNotification('Por favor, introduce contenido para analizar', 'error');
        return;
    }
    
    // Simulate analysis
    const resultEl = document.getElementById('verify-result');
    resultEl.classList.remove('hidden');
    resultEl.innerHTML = `
        <div class="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <div class="flex items-center gap-3 mb-3">
                <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                <h4 class="font-semibold text-red-400">Amenaza Detectada</h4>
            </div>
            <div class="space-y-2 text-sm">
                <p><strong>Tipo:</strong> Phishing</p>
                <p><strong>Nivel de riesgo:</strong> Alto (87%)</p>
                <p><strong>Indicadores:</strong></p>
                <ul class="list-disc list-inside text-gray-400 ml-4">
                    <li>URL sospechosa detectada</li>
                    <li>Solicitud de datos personales</li>
                    <li>Urgencia artificial</li>
                    <li>Remitente no verificado</li>
                </ul>
            </div>
        </div>
    `;
    
    showNotification('Análisis completado', 'success');
}

function addToScamDatabase() {
    const content = document.getElementById('verify-content').value;
    const type = document.getElementById('verify-type').value;
    const risk = document.getElementById('verify-risk').value;
    
    if (!content) {
        showNotification('Por favor, introduce contenido', 'error');
        return;
    }
    
    // Simulate adding to database
    showNotification('Estafa añadida a la base de datos', 'success');
    
    // Clear form
    document.getElementById('verify-content').value = '';
    document.getElementById('verify-url').value = '';
    document.getElementById('verify-phone').value = '';
    document.getElementById('verify-notes').value = '';
    document.getElementById('verify-result').classList.add('hidden');
}

// Reports
function loadReports() {
    // Generate chart
    const chartEl = document.getElementById('threats-chart');
    const data = [45, 32, 67, 54, 78, 23, 41];
    const max = Math.max(...data);
    
    chartEl.innerHTML = data.map((value, i) => `
        <div class="flex-1 flex flex-col items-center">
            <div class="w-full bg-indigo-600 rounded-t transition-all duration-500" style="height: ${(value/max)*100}%"></div>
            <span class="text-xs text-gray-500 mt-1">${value}</span>
        </div>
    `).join('');
}

// Chat
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML += `
        <div class="flex items-start gap-3">
            <div class="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-sm font-semibold">
                ${getInitials(currentUser.name)}
            </div>
            <div>
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-sm">${currentUser.name}</span>
                    <span class="text-xs text-gray-500">${new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <p class="text-gray-300 text-sm">${message}</p>
            </div>
        </div>
    `;
    
    input.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Utility functions
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRoleName(role) {
    const roles = { admin: 'Administrador', supervisor: 'Supervisor', agent: 'Agente' };
    return roles[role] || role;
}

function getStatusName(status) {
    const statuses = {
        pending: 'Pendiente',
        investigating: 'Investigando',
        resolved: 'Resuelto',
        open: 'Abierto',
        in_progress: 'En Progreso',
        closed: 'Cerrado'
    };
    return statuses[status] || status;
}

function getSeverityBg(severity) {
    const bgs = { critical: 'bg-red-500/20', high: 'bg-orange-500/20', medium: 'bg-yellow-500/20', low: 'bg-green-500/20' };
    return bgs[severity] || 'bg-gray-500/20';
}

function getSeverityColor(severity) {
    const colors = { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-green-400' };
    return colors[severity] || 'text-gray-400';
}

function getSeverityBadge(severity) {
    const badges = {
        critical: 'bg-red-500/20 text-red-400',
        high: 'bg-orange-500/20 text-orange-400',
        medium: 'bg-yellow-500/20 text-yellow-400',
        low: 'bg-green-500/20 text-green-400'
    };
    return badges[severity] || '';
}

function getPriorityBg(priority) {
    const bgs = { high: 'bg-red-500/20', medium: 'bg-orange-500/20', low: 'bg-blue-500/20' };
    return bgs[priority] || 'bg-gray-500/20';
}

function getPriorityColor(priority) {
    const colors = { high: 'text-red-400', medium: 'text-orange-400', low: 'text-blue-400' };
    return colors[priority] || 'text-gray-400';
}

function getPriorityBadgeClass(priority) {
    const classes = {
        high: 'bg-red-500/20 text-red-400',
        medium: 'bg-orange-500/20 text-orange-400',
        low: 'bg-blue-500/20 text-blue-400'
    };
    return classes[priority] || '';
}

function getPlanBadge(plan) {
    const badges = {
        free: 'bg-gray-600 text-gray-300',
        premium: 'bg-indigo-600 text-white',
        family: 'bg-purple-600 text-white',
        enterprise: 'bg-yellow-600 text-black'
    };
    return badges[plan] || 'bg-gray-600';
}

function getThreatIcon(type) {
    const icons = { phishing: 'fa-fish', smishing: 'fa-sms', vishing: 'fa-phone-volume', malware: 'fa-bug' };
    return icons[type] || 'fa-exclamation-triangle';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Ahora mismo';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} h`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-up ${
        type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Make functions global
window.assignThreat = assignThreat;
window.resolveThreat = resolveThreat;
window.viewClient = (id) => console.log('View client:', id);
