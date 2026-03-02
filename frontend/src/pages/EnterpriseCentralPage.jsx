import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, TrendingUp, BarChart3, Package, Calendar, ChevronRight, Plus, Search, Filter, Building2, Phone, Mail, MapPin, Clock, DollarSign, FileText, X, Check, AlertCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const LEAD_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
const STAGE_LABELS = { new: 'Nuevo', contacted: 'Contactado', qualified: 'Cualificado', proposal: 'Propuesta', negotiation: 'Negociacion', closed: 'Cerrado', lost: 'Perdido' };
const STAGE_COLORS = { new: 'bg-blue-500', contacted: 'bg-yellow-500', qualified: 'bg-indigo-500', proposal: 'bg-purple-500', negotiation: 'bg-orange-500', closed: 'bg-emerald-500', lost: 'bg-red-500' };

function MetricCard({ icon: Icon, label, value, trend, color = 'text-white' }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-indigo-400" />
        <span className="text-slate-400 text-xs font-medium">{label}</span>
      </div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {trend && <div className="text-emerald-400 text-[10px] mt-1">{trend}</div>}
    </div>
  );
}

function LeadModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'web', interest: '', notes: '', neighborhood: '' });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
    setForm({ name: '', email: '', phone: '', source: 'web', interest: '', notes: '', neighborhood: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="lead-modal">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-bold">Nuevo Lead</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input type="text" placeholder="Nombre *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500" data-testid="lead-name" />
          <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500" data-testid="lead-email" />
          <input type="tel" placeholder="Telefono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-phone" />
          <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="lead-source">
            <option value="web">Web</option>
            <option value="referido">Referido</option>
            <option value="telefono">Telefono</option>
            <option value="evento">Evento</option>
            <option value="otro">Otro</option>
          </select>
          <input type="text" placeholder="Barrio / Zona" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-neighborhood" />
          <input type="text" placeholder="Interes (ej: alarma hogar, vecinal)" value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-interest" />
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none" data-testid="lead-notes" />
          <button type="submit" disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" data-testid="submit-lead">
            {saving ? 'Guardando...' : 'Crear Lead'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InstallModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ client_name: '', address: '', phone: '', plan_type: 'alarm-essential', scheduled_date: '', notes: '' });
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
    setForm({ client_name: '', address: '', phone: '', plan_type: 'alarm-essential', scheduled_date: '', notes: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="install-modal">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-white font-bold">Programar Instalacion</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input type="text" placeholder="Nombre cliente *" required value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="install-name" />
          <input type="text" placeholder="Direccion *" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="install-address" />
          <input type="tel" placeholder="Telefono *" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="install-phone" />
          <select value={form.plan_type} onChange={e => setForm(f => ({ ...f, plan_type: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="install-plan">
            <option value="alarm-essential">Alarma Essential</option>
            <option value="alarm-premium">Alarma Premium</option>
            <option value="alarm-business">Alarma Business</option>
            <option value="vecinal-anual">Vecinal Premium</option>
          </select>
          <input type="datetime-local" required value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="install-date" />
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none" data-testid="install-notes" />
          <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" data-testid="submit-install">
            {saving ? 'Guardando...' : 'Programar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EnterpriseCentralPage() {
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, leadsRes, installRes, pipeRes] = await Promise.all([
        fetch(`${API}/api/enterprise-central/dashboard`),
        fetch(`${API}/api/enterprise-central/leads?limit=50`),
        fetch(`${API}/api/enterprise-central/installations?limit=50`),
        fetch(`${API}/api/enterprise-central/leads/pipeline`),
      ]);
      const [d, l, i, p] = await Promise.all([dashRes.json(), leadsRes.json(), installRes.json(), pipeRes.json()]);
      setDashboard(d);
      setLeads(l.leads || []);
      setInstallations(i.installations || []);
      setPipeline(p);
    } catch (e) {
      console.error('Enterprise fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const createLead = async (data) => {
    await fetch(`${API}/api/enterprise-central/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchAll();
  };

  const updateLeadStatus = async (leadId, status) => {
    await fetch(`${API}/api/enterprise-central/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const createInstallation = async (data) => {
    await fetch(`${API}/api/enterprise-central/installations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    fetchAll();
  };

  const updateInstallStatus = async (installId, status) => {
    await fetch(`${API}/api/enterprise-central/installations/${installId}?status=${status}`, { method: 'PATCH' });
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'leads', label: 'CRM Ventas', icon: Users },
    { id: 'installations', label: 'Instalaciones', icon: Package },
  ];

  const filteredLeads = statusFilter ? leads.filter(l => l.status === statusFilter) : leads;

  return (
    <div className="min-h-screen bg-slate-950" data-testid="enterprise-central-page">
      {/* Sidebar + Content Layout */}
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800 p-4 hidden lg:flex flex-col">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div>
              <span className="text-white font-bold text-sm block">ManoProtect</span>
              <span className="text-slate-500 text-[10px]">Enterprise</span>
            </div>
          </Link>
          <nav className="space-y-1 flex-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                data-testid={`nav-${tab.id}`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-800">
            <Link to="/ceo" className="text-slate-500 hover:text-white text-xs transition-colors flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Panel CEO</Link>
          </div>
        </aside>

        {/* Mobile top nav */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <Link to="/" className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0"><Shield className="w-3.5 h-3.5 text-white" /></Link>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-400'}`}
              data-testid={`mobile-nav-${tab.id}`}
            >
              <tab.icon className="w-3 h-3" />{tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-y-auto">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && dashboard && (
            <div className="space-y-6" data-testid="dashboard-content">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-white font-black text-2xl">Panel Central</h1>
                  <p className="text-slate-500 text-xs mt-1">Vista general de la empresa</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard icon={Users} label="Usuarios totales" value={dashboard.overview?.total_users || 0} />
                <MetricCard icon={TrendingUp} label="Suscripciones activas" value={dashboard.overview?.active_subscriptions || 0} color="text-emerald-400" />
                <MetricCard icon={Building2} label="Empleados activos" value={dashboard.overview?.active_employees || 0} color="text-indigo-400" />
                <MetricCard icon={Mail} label="Newsletter" value={dashboard.overview?.newsletter_subscribers || 0} />
              </div>

              {/* Revenue */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-4">Ingresos estimados</h3>
                <div className="grid sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{dashboard.revenue?.estimated_monthly || 0} EUR</div>
                    <div className="text-slate-500 text-xs mt-1">MRR estimado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{dashboard.revenue?.vecinal_subscribers || 0}</div>
                    <div className="text-slate-500 text-xs mt-1">Subs Vecinal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{dashboard.revenue?.alarm_subscribers || 0}</div>
                    <div className="text-slate-500 text-xs mt-1">Subs Alarma</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">{dashboard.revenue?.family_subscribers || 0}</div>
                    <div className="text-slate-500 text-xs mt-1">Subs Familiar</div>
                  </div>
                </div>
              </div>

              {/* Sales Pipeline Mini */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-bold text-lg">Pipeline de Ventas</h3>
                  <span className="text-slate-500 text-xs">{dashboard.sales?.leads_this_month || 0} leads este mes</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {LEAD_STAGES.filter(s => s !== 'lost').map(stage => (
                    <div key={stage} className="flex-1 min-w-[80px] bg-slate-900/60 rounded-xl p-3 text-center">
                      <div className={`w-3 h-3 ${STAGE_COLORS[stage]} rounded-full mx-auto mb-2`} />
                      <div className="text-white font-bold text-lg">{dashboard.sales?.pipeline?.[stage] || pipeline?.pipeline?.[stage] || 0}</div>
                      <div className="text-slate-500 text-[10px]">{STAGE_LABELS[stage]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-white font-bold text-lg mb-2">Operaciones</h3>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">{dashboard.operations?.pending_installations || 0}</span>
                  <span className="text-slate-400 text-sm">instalaciones pendientes</span>
                  <button onClick={() => setActiveTab('installations')} className="ml-auto text-indigo-400 text-xs hover:text-indigo-300">Ver todas</button>
                </div>
              </div>
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-4" data-testid="leads-content">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-white font-black text-xl">CRM de Ventas</h1>
                <button onClick={() => setShowLeadModal(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5" data-testid="new-lead-btn">
                  <Plus className="w-3.5 h-3.5" /> Nuevo Lead
                </button>
              </div>

              {/* Filter pills */}
              <div className="flex gap-1.5 flex-wrap">
                <button onClick={() => setStatusFilter('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!statusFilter ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white bg-slate-800'}`} data-testid="filter-all">Todos</button>
                {LEAD_STAGES.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white bg-slate-800'}`} data-testid={`filter-${s}`}>
                    {STAGE_LABELS[s]}
                  </button>
                ))}
              </div>

              {/* Leads Table */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" data-testid="leads-table">
                    <thead>
                      <tr className="border-b border-slate-700/50 text-slate-400 text-xs">
                        <th className="text-left p-3 font-medium">Nombre</th>
                        <th className="text-left p-3 font-medium">Contacto</th>
                        <th className="text-left p-3 font-medium">Interes</th>
                        <th className="text-left p-3 font-medium">Estado</th>
                        <th className="text-left p-3 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-12 text-slate-500">Sin leads{statusFilter ? ` en "${STAGE_LABELS[statusFilter]}"` : ''}. Crea el primero.</td></tr>
                      ) : filteredLeads.map(lead => (
                        <tr key={lead.lead_id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors" data-testid={`lead-row-${lead.lead_id}`}>
                          <td className="p-3">
                            <div className="text-white font-semibold">{lead.name}</div>
                            {lead.neighborhood && <div className="text-slate-500 text-[10px] flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{lead.neighborhood}</div>}
                          </td>
                          <td className="p-3">
                            <div className="text-slate-300 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</div>
                            {lead.phone && <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" />{lead.phone}</div>}
                          </td>
                          <td className="p-3 text-slate-400 text-xs">{lead.interest || '-'}</td>
                          <td className="p-3">
                            <select value={lead.status} onChange={e => updateLeadStatus(lead.lead_id, e.target.value)}
                              className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white" data-testid={`status-select-${lead.lead_id}`}>
                              {LEAD_STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              {lead.status === 'new' && (
                                <button onClick={() => updateLeadStatus(lead.lead_id, 'contacted')} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium" data-testid={`contact-${lead.lead_id}`}>Contactar</button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* INSTALLATIONS TAB */}
          {activeTab === 'installations' && (
            <div className="space-y-4" data-testid="installations-content">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-white font-black text-xl">Instalaciones</h1>
                <button onClick={() => setShowInstallModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5" data-testid="new-install-btn">
                  <Plus className="w-3.5 h-3.5" /> Programar
                </button>
              </div>

              <div className="space-y-3">
                {installations.length === 0 ? (
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-12 text-center">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Sin instalaciones programadas</p>
                  </div>
                ) : installations.map(inst => (
                  <div key={inst.install_id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all" data-testid={`install-${inst.install_id}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold text-sm">{inst.client_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inst.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' : inst.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>{inst.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inst.address}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{inst.scheduled_date}</span>
                        </div>
                        <div className="text-slate-500 text-xs mt-1">{inst.plan_type} | {inst.phone}</div>
                      </div>
                      <div className="flex gap-1.5">
                        {inst.status === 'pending' && (
                          <>
                            <button onClick={() => updateInstallStatus(inst.install_id, 'in_progress')} className="text-indigo-400 hover:text-indigo-300 text-xs font-medium px-2 py-1 bg-indigo-500/10 rounded-lg" data-testid={`start-${inst.install_id}`}>Iniciar</button>
                            <button onClick={() => updateInstallStatus(inst.install_id, 'completed')} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-lg" data-testid={`complete-${inst.install_id}`}>Completar</button>
                          </>
                        )}
                        {inst.status === 'in_progress' && (
                          <button onClick={() => updateInstallStatus(inst.install_id, 'completed')} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium px-2 py-1 bg-emerald-500/10 rounded-lg">Completar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <LeadModal open={showLeadModal} onClose={() => setShowLeadModal(false)} onSubmit={createLead} />
      <InstallModal open={showInstallModal} onClose={() => setShowInstallModal(false)} onSubmit={createInstallation} />
    </div>
  );
}
