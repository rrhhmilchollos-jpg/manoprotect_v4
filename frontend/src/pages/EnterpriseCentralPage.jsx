/**
 * ManoProtect — CRM de Ventas Profesional
 * Pipeline completo, comisiones, calendario, stock, dashboard CEO
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Users, TrendingUp, BarChart3, Package, Calendar, ChevronRight, Plus,
  Search, Filter, Building2, Phone, Mail, MapPin, Clock, DollarSign, FileText,
  X, Check, AlertCircle, Target, Award, Eye, Lock, ArrowRight, Trash2, Edit,
  BookOpen, Newspaper, Download, Maximize2, ChevronDown, ChevronUp, Zap, Star
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const LEAD_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'];
const STAGE_LABELS = { new: 'Primer Contacto', contacted: 'Visita Realizada', qualified: 'Estudio Seguridad', proposal: 'Propuesta Enviada', negotiation: 'Negociacion', closed: 'Cierre Contrato', lost: 'Perdido' };
const STAGE_COLORS = { new: 'bg-blue-500', contacted: 'bg-cyan-500', qualified: 'bg-indigo-500', proposal: 'bg-purple-500', negotiation: 'bg-orange-500', closed: 'bg-emerald-500', lost: 'bg-red-500' };

const SENTINEL_IMG = 'https://customer-assets.emergentagent.com/job_33b1d023-8b05-4946-8f90-203a20a655d6/artifacts/wcs7ov15_Cerradura%20inteligente.png';
const PRODUCT_IMGS = {
  sentinel_lock: 'https://customer-assets.emergentagent.com/job_33b1d023-8b05-4946-8f90-203a20a655d6/artifacts/p1c1gqmj_Cerradura%20inteligente%20%281%29.png',
  panel: null, camera: null, sensor_pir: null, siren: null, keypad: null,
};
const PRODUCT_LABELS = { sentinel_lock: 'Sentinel Lock', panel: 'Panel Alarma', camera: 'Camara HD', sensor_pir: 'Sensor PIR', siren: 'Sirena', keypad: 'Teclado' };
const STOCK_STATUS_COLORS = { available: 'bg-emerald-500', reserved: 'bg-amber-500', sold: 'bg-blue-500', installed: 'bg-indigo-500', defective: 'bg-red-500' };

const EVENT_TYPE_LABELS = { visit: 'Visita', security_study: 'Estudio Seguridad', proposal: 'Propuesta', installation: 'Instalacion', follow_up: 'Seguimiento' };
const EVENT_TYPE_COLORS = { visit: 'bg-blue-500', security_study: 'bg-indigo-500', proposal: 'bg-purple-500', installation: 'bg-emerald-500', follow_up: 'bg-amber-500' };

/* ─── PRODUCT CARD (Catalog) ─── */
function ProductCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl overflow-hidden" data-testid={`product-${product.id}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-4 p-4 text-left hover:bg-slate-800 transition">
        <span className="text-3xl">{product.img}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-white font-bold text-sm">{product.name}</h3>
            <span className="text-indigo-400 text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">{product.category}</span>
          </div>
          <p className="text-slate-400 text-[11px] line-clamp-1">{product.desc}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-white font-black text-lg">{product.price} EUR</p>
          <p className="text-slate-500 text-[9px]">{product.priceType}</p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-3">
          <p className="text-slate-300 text-xs mb-3">{product.desc}</p>
          <h4 className="text-indigo-400 text-[10px] font-bold mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> CARACTERISTICAS</h4>
          <div className="grid grid-cols-2 gap-1.5">
            {product.features.map((f, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-400">
                <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 mt-0.5" /> {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAGAZINE SECTION ─── */
function MagazineSection({ title, subtitle, color, items }) {
  const colors = { indigo: 'border-indigo-500/30 bg-indigo-500/5', emerald: 'border-emerald-500/30 bg-emerald-500/5', amber: 'border-amber-500/30 bg-amber-500/5', purple: 'border-purple-500/30 bg-purple-500/5' };
  const titleColors = { indigo: 'text-indigo-400', emerald: 'text-emerald-400', amber: 'text-amber-400', purple: 'text-purple-400' };
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <h3 className={`font-bold text-sm ${titleColors[color]} mb-0.5`}>{title}</h3>
      <p className="text-slate-500 text-[10px] mb-3">{subtitle}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <Star className={`w-3.5 h-3.5 ${titleColors[color]} flex-shrink-0 mt-0.5`} />
            <div>
              <p className="text-white text-xs font-bold">{item.title}</p>
              <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── METRIC CARD ─── */
function MetricCard({ icon: Icon, label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4" data-testid={`metric-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-center gap-2 mb-2"><Icon className="w-4 h-4 text-indigo-400" /><span className="text-slate-400 text-xs">{label}</span></div>
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-slate-500 text-[10px] mt-1">{sub}</div>}
    </div>
  );
}

/* ─── LEAD MODAL ─── */
function LeadModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: 'web', interest: '', notes: '', neighborhood: '', assigned_to: '' });
  const [saving, setSaving] = useState(false);
  if (!open) return null;
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSubmit(form); setSaving(false); setForm({ name: '', email: '', phone: '', source: 'web', interest: '', notes: '', neighborhood: '', assigned_to: '' }); onClose(); };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="lead-modal">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between"><h3 className="text-white font-bold">Nuevo Lead</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input type="text" placeholder="Nombre *" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-name" />
          <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-email" />
          <input type="tel" placeholder="Telefono" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-phone" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="lead-source">
              <option value="web">Web</option><option value="chatbot">Chatbot</option><option value="referido">Referido</option><option value="telefono">Telefono</option><option value="evento">Evento</option>
            </select>
            <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
              <option value="">Sin asignar</option><option value="com-001">Diego Fernandez</option><option value="com-002">Laura Sanchez</option>
            </select>
          </div>
          <input type="text" placeholder="Barrio / Zona" value={form.neighborhood} onChange={e => setForm(f => ({ ...f, neighborhood: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-neighborhood" />
          <input type="text" placeholder="Interes (alarma hogar, sentinel, vecinal...)" value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="lead-interest" />
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none" data-testid="lead-notes" />
          <button type="submit" disabled={saving} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" data-testid="submit-lead">{saving ? 'Guardando...' : 'Crear Lead'}</button>
        </form>
      </div>
    </div>
  );
}

/* ─── CALENDAR EVENT MODAL ─── */
function CalendarEventModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', event_type: 'visit', date: '', time: '', assigned_to: '', address: '', notes: '', lead_id: '' });
  const [saving, setSaving] = useState(false);
  if (!open) return null;
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSubmit(form); setSaving(false); setForm({ title: '', event_type: 'visit', date: '', time: '', assigned_to: '', address: '', notes: '', lead_id: '' }); onClose(); };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()} data-testid="calendar-modal">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between"><h3 className="text-white font-bold">Nueva Cita</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input type="text" placeholder="Titulo *" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="event-title" />
          <select value={form.event_type} onChange={e => setForm(f => ({ ...f, event_type: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="event-type">
            <option value="visit">Visita comercial</option><option value="security_study">Estudio de seguridad</option><option value="proposal">Entrega propuesta</option><option value="installation">Instalacion</option><option value="follow_up">Seguimiento</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" required value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="event-date" />
            <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="event-time" />
          </div>
          <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
            <option value="">Sin asignar</option><option value="com-001">Diego Fernandez</option><option value="com-002">Laura Sanchez</option>
          </select>
          <input type="text" placeholder="Direccion" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" />
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none" />
          <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" data-testid="submit-event">{saving ? 'Guardando...' : 'Crear Cita'}</button>
        </form>
      </div>
    </div>
  );
}

/* ─── STOCK MODAL ─── */
function StockModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ product_type: 'sentinel_lock', model: 'Sentinel Lock DIN v1', serial_number: '', status: 'available', notes: '' });
  const [saving, setSaving] = useState(false);
  if (!open) return null;
  const handleSubmit = async (e) => { e.preventDefault(); setSaving(true); await onSubmit(form); setSaving(false); setForm({ product_type: 'sentinel_lock', model: 'Sentinel Lock DIN v1', serial_number: '', status: 'available', notes: '' }); onClose(); };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()} data-testid="stock-modal">
        <div className="p-5 border-b border-slate-700 flex items-center justify-between"><h3 className="text-white font-bold">Nuevo Producto en Stock</h3><button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <select value={form.product_type} onChange={e => setForm(f => ({ ...f, product_type: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" data-testid="stock-type">
            <option value="sentinel_lock">Sentinel Lock</option><option value="panel">Panel Alarma</option><option value="camera">Camara HD</option><option value="sensor_pir">Sensor PIR</option><option value="siren">Sirena</option><option value="keypad">Teclado</option>
          </select>
          <input type="text" placeholder="Modelo" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" />
          <input type="text" placeholder="Numero de serie *" required value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500" data-testid="stock-serial" />
          <textarea placeholder="Notas" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 resize-none" />
          <button type="submit" disabled={saving} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm disabled:opacity-50" data-testid="submit-stock">{saving ? 'Guardando...' : 'Anadir a Stock'}</button>
        </form>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════
   MAIN CRM PAGE
   ═══════════════════════════════════════════ */
export default function EnterpriseCentralPage() {
  const [dashboard, setDashboard] = useState(null);
  const [leads, setLeads] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [commercials, setCommercials] = useState([]);
  const [stock, setStock] = useState({ items: [], summary: {} });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [dashRes, leadsRes, installRes, pipeRes, calRes, comRes, stockRes] = await Promise.all([
        fetch(`${API}/api/enterprise-central/dashboard`),
        fetch(`${API}/api/enterprise-central/leads?limit=100`),
        fetch(`${API}/api/enterprise-central/installations?limit=50`),
        fetch(`${API}/api/enterprise-central/leads/pipeline`),
        fetch(`${API}/api/enterprise-central/calendar`),
        fetch(`${API}/api/enterprise-central/commercials`),
        fetch(`${API}/api/enterprise-central/stock`),
      ]);
      const [d, l, i, p, cal, com, st] = await Promise.all([dashRes.json(), leadsRes.json(), installRes.json(), pipeRes.json(), calRes.json(), comRes.json(), stockRes.json()]);
      setDashboard(d);
      setLeads(l.leads || []);
      setInstallations(i.installations || []);
      setPipeline(p);
      setCalendarEvents(cal.events || []);
      setCommercials(com.commercials || []);
      setStock(st);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const handler = () => fetchAll(); window.addEventListener('manoprotect-refresh', handler); return () => window.removeEventListener('manoprotect-refresh', handler); }, [fetchAll]);

  const createLead = async (data) => { await fetch(`${API}/api/enterprise-central/leads`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); toast.success('Lead creado'); fetchAll(); };
  const updateLeadStatus = async (leadId, status) => { await fetch(`${API}/api/enterprise-central/leads/${leadId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); toast.success(`Lead ${STAGE_LABELS[status] || status}`); fetchAll(); };
  const createCalendarEvent = async (data) => { await fetch(`${API}/api/enterprise-central/calendar`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); toast.success('Cita creada'); fetchAll(); };
  const addStockItem = async (data) => { await fetch(`${API}/api/enterprise-central/stock`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); toast.success('Producto anadido'); fetchAll(); };

  if (loading) return (<div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" /></div>);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard CEO', icon: BarChart3 },
    { id: 'pipeline', label: 'Pipeline Ventas', icon: TrendingUp },
    { id: 'leads', label: 'Leads', icon: Users },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'commercials', label: 'Comerciales', icon: Award },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'installations', label: 'Instalaciones', icon: Building2 },
    { id: 'catalog', label: 'Catalogo Productos', icon: BookOpen },
    { id: 'magazine', label: 'Manoprotect Vision', icon: Newspaper },
  ];

  const filteredLeads = statusFilter ? leads.filter(l => l.status === statusFilter) : leads;
  const pipeData = pipeline?.pipeline || {};

  return (
    <div className="min-h-screen bg-slate-950" data-testid="enterprise-central-page">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-56 bg-slate-900 border-r border-slate-800 p-4 hidden lg:flex flex-col flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
            <div><span className="text-white font-bold text-sm block">ManoProtect</span><span className="text-slate-500 text-[10px]">CRM Profesional</span></div>
          </Link>
          <nav className="space-y-1 flex-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                data-testid={`nav-${tab.id}`}
              ><tab.icon className="w-3.5 h-3.5" />{tab.label}</button>
            ))}
          </nav>
          <div className="border-t border-slate-800 pt-3 mt-3 space-y-1">
            <Link to="/cra-operador" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"><Eye className="w-3.5 h-3.5" /> CRA Operador</Link>
            <Link to="/mi-seguridad" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800"><Lock className="w-3.5 h-3.5" /> App Cliente</Link>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Mobile tabs */}
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2 lg:hidden">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-bold ${activeTab === t.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{t.label}</button>
            ))}
          </div>

          {/* ═══ DASHBOARD CEO ═══ */}
          {activeTab === 'dashboard' && dashboard && (
            <div data-testid="dashboard-ceo">
              <h2 className="text-white text-xl font-black mb-4">Dashboard CEO</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                <MetricCard icon={Users} label="Leads este mes" value={dashboard.sales.leads_this_month} />
                <MetricCard icon={TrendingUp} label="Conversion" value={`${dashboard.sales.conversion_rate}%`} color="text-emerald-400" />
                <MetricCard icon={DollarSign} label="Ingresos est." value={`${dashboard.revenue.estimated_monthly} EUR`} color="text-emerald-400" />
                <MetricCard icon={Package} label="Stock disponible" value={dashboard.stock.available} sub={`${dashboard.stock.reserved} reservados`} />
                <MetricCard icon={Shield} label="Suscripciones" value={dashboard.overview.active_subscriptions} />
                <MetricCard icon={Building2} label="Instalaciones pend." value={dashboard.operations.pending_installations} />
                <MetricCard icon={Users} label="Empleados" value={dashboard.overview.active_employees} />
                <MetricCard icon={Mail} label="Newsletter" value={dashboard.overview.newsletter_subscribers} />
              </div>

              {/* Pipeline visual */}
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 mb-6" data-testid="pipeline-visual">
                <h3 className="text-white font-bold text-sm mb-4">Embudo de Ventas</h3>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {LEAD_STAGES.map(stage => {
                    const count = pipeData[stage] || 0;
                    return (
                      <div key={stage} className="flex-1 min-w-[100px]">
                        <div className={`${STAGE_COLORS[stage]} rounded-lg p-3 text-center mb-1`}>
                          <p className="text-white text-lg font-black">{count}</p>
                        </div>
                        <p className="text-slate-400 text-[9px] text-center font-medium">{STAGE_LABELS[stage]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Commercials performance + Calendar */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5" data-testid="commercial-performance">
                  <h3 className="text-white font-bold text-sm mb-3">Rendimiento Comerciales</h3>
                  {commercials.length === 0 ? <p className="text-slate-500 text-xs">Sin objetivos configurados</p> :
                    commercials.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 mb-2">
                        <div className="w-9 h-9 bg-indigo-500/20 rounded-lg flex items-center justify-center"><Award className="w-4 h-4 text-indigo-400" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold">{c.commercial_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-slate-800 rounded-full h-2">
                              <div className={`h-2 rounded-full ${c.target_progress >= 100 ? 'bg-emerald-500' : c.target_progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(c.target_progress, 100)}%` }} />
                            </div>
                            <span className="text-slate-400 text-[10px]">{c.target_progress}%</span>
                          </div>
                          <p className="text-slate-500 text-[10px] mt-0.5">{c.actual_closed}/{c.target_closed} cierres | Comision: {c.commission_earned} EUR</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5" data-testid="upcoming-events">
                  <h3 className="text-white font-bold text-sm mb-3">Proximas Citas</h3>
                  {(dashboard.upcoming_events || []).length === 0 ? <p className="text-slate-500 text-xs">Sin citas programadas</p> :
                    (dashboard.upcoming_events || []).map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-900/40 rounded-xl p-3 mb-2">
                        <div className={`w-2 h-8 rounded-full ${EVENT_TYPE_COLORS[ev.event_type] || 'bg-slate-500'}`} />
                        <div className="flex-1">
                          <p className="text-white text-xs font-bold">{ev.title}</p>
                          <p className="text-slate-500 text-[10px]">{ev.date} {ev.time} — {ev.address}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}

          {/* ═══ PIPELINE VISUAL ═══ */}
          {activeTab === 'pipeline' && (
            <div data-testid="pipeline-tab">
              <h2 className="text-white text-xl font-black mb-4">Pipeline de Ventas</h2>
              <div className="flex gap-3 overflow-x-auto pb-4">
                {LEAD_STAGES.map(stage => {
                  const stageLeads = leads.filter(l => l.status === stage);
                  return (
                    <div key={stage} className="min-w-[220px] flex-1">
                      <div className={`${STAGE_COLORS[stage]} rounded-t-xl px-3 py-2 flex items-center justify-between`}>
                        <span className="text-white text-xs font-bold">{STAGE_LABELS[stage]}</span>
                        <span className="text-white/70 text-xs bg-white/20 px-2 rounded-full">{stageLeads.length}</span>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-b-xl p-2 space-y-2 min-h-[200px]">
                        {stageLeads.map(lead => (
                          <div key={lead.lead_id} className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-3">
                            <p className="text-white text-xs font-bold truncate">{lead.name}</p>
                            <p className="text-slate-400 text-[10px] truncate">{lead.phone || lead.email}</p>
                            <p className="text-slate-500 text-[10px]">{lead.interest || 'Sin especificar'}</p>
                            {lead.assigned_to && <p className="text-indigo-400 text-[10px] mt-1">Asignado: {lead.assigned_to}</p>}
                            {stage !== 'closed' && stage !== 'lost' && (
                              <div className="flex gap-1 mt-2">
                                {LEAD_STAGES.indexOf(stage) < LEAD_STAGES.length - 2 && (
                                  <button onClick={() => updateLeadStatus(lead.lead_id, LEAD_STAGES[LEAD_STAGES.indexOf(stage) + 1])} className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded font-bold hover:bg-indigo-500/30">Avanzar</button>
                                )}
                                <button onClick={() => updateLeadStatus(lead.lead_id, 'lost')} className="text-[9px] bg-red-500/20 text-red-400 px-2 py-1 rounded font-bold hover:bg-red-500/30">Perdido</button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ LEADS LIST ═══ */}
          {activeTab === 'leads' && (
            <div data-testid="leads-tab">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-black">Leads</h2>
                <button onClick={() => setShowLeadModal(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1" data-testid="add-lead-btn"><Plus className="w-3.5 h-3.5" /> Nuevo Lead</button>
              </div>
              <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                <button onClick={() => setStatusFilter('')} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${!statusFilter ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>Todos</button>
                {LEAD_STAGES.map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 ${statusFilter === s ? STAGE_COLORS[s] + ' text-white' : 'bg-slate-800 text-slate-400'}`}>{STAGE_LABELS[s]}</button>
                ))}
              </div>
              <div className="space-y-2">
                {filteredLeads.map(lead => {
                  const sc = STAGE_COLORS[lead.status] || 'bg-slate-500';
                  return (
                    <div key={lead.lead_id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4" data-testid={`lead-${lead.lead_id}`}>
                      <div className={`w-2 h-10 rounded-full ${sc}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-white text-sm font-bold truncate">{lead.name}</p>
                          <span className={`${sc} text-white text-[9px] px-2 py-0.5 rounded-full font-bold`}>{STAGE_LABELS[lead.status]}</span>
                        </div>
                        <p className="text-slate-400 text-xs">{lead.phone} | {lead.email}</p>
                        <p className="text-slate-500 text-[10px]">{lead.interest} — {lead.neighborhood} | Fuente: {lead.source}</p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {lead.status !== 'closed' && lead.status !== 'lost' && LEAD_STAGES.indexOf(lead.status) < 5 && (
                          <button onClick={() => updateLeadStatus(lead.lead_id, LEAD_STAGES[LEAD_STAGES.indexOf(lead.status) + 1])} className="bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-500/30" data-testid={`advance-${lead.lead_id}`}>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ CALENDAR ═══ */}
          {activeTab === 'calendar' && (
            <div data-testid="calendar-tab">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-black">Calendario de Citas</h2>
                <button onClick={() => setShowCalendarModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1" data-testid="add-event-btn"><Plus className="w-3.5 h-3.5" /> Nueva Cita</button>
              </div>
              <div className="space-y-2">
                {calendarEvents.length === 0 ? <p className="text-slate-500 text-sm text-center py-10">Sin citas programadas</p> :
                  calendarEvents.map(ev => (
                    <div key={ev.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4" data-testid={`event-${ev.id}`}>
                      <div className={`w-10 h-10 ${EVENT_TYPE_COLORS[ev.event_type] || 'bg-slate-500'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-bold">{ev.title}</p>
                        <p className="text-slate-400 text-xs">{ev.date} {ev.time} — {EVENT_TYPE_LABELS[ev.event_type] || ev.event_type}</p>
                        <p className="text-slate-500 text-[10px]">{ev.address} {ev.assigned_to ? `| ${ev.assigned_to}` : ''}</p>
                      </div>
                      <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${ev.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>{ev.status}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* ═══ COMMERCIALS ═══ */}
          {activeTab === 'commercials' && (
            <div data-testid="commercials-tab">
              <h2 className="text-white text-xl font-black mb-4">Comerciales — Comisiones y Objetivos</h2>
              {commercials.length === 0 ? <p className="text-slate-500 text-sm text-center py-10">Sin comerciales configurados</p> :
                <div className="grid sm:grid-cols-2 gap-4">
                  {commercials.map((c, i) => (
                    <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5" data-testid={`commercial-${c.commercial_id}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center"><Award className="w-6 h-6 text-indigo-400" /></div>
                        <div>
                          <p className="text-white font-bold">{c.commercial_name}</p>
                          <p className="text-slate-500 text-xs">ID: {c.commercial_id} | Mes: {c.month}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center bg-slate-900/50 rounded-xl p-3"><p className="text-xl font-black text-white">{c.actual_leads || 0}</p><p className="text-[10px] text-slate-500">Leads / {c.target_leads}</p></div>
                        <div className="text-center bg-slate-900/50 rounded-xl p-3"><p className="text-xl font-black text-emerald-400">{c.actual_closed || 0}</p><p className="text-[10px] text-slate-500">Cierres / {c.target_closed}</p></div>
                        <div className="text-center bg-slate-900/50 rounded-xl p-3"><p className="text-xl font-black text-amber-400">{c.commission_earned || 0} EUR</p><p className="text-[10px] text-slate-500">Comision ({(c.commission_rate * 100)}%)</p></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Progreso objetivo</span><span>{c.target_progress}%</span></div>
                        <div className="bg-slate-800 rounded-full h-3">
                          <div className={`h-3 rounded-full transition-all ${c.target_progress >= 100 ? 'bg-emerald-500' : c.target_progress >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(c.target_progress, 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ═══ STOCK ═══ */}
          {activeTab === 'stock' && (
            <div data-testid="stock-tab">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white text-xl font-black">Stock e Inventario</h2>
                <button onClick={() => setShowStockModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1" data-testid="add-stock-btn"><Plus className="w-3.5 h-3.5" /> Anadir Producto</button>
              </div>
              {/* Sentinel Lock highlight */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 mb-6 flex items-center gap-5" data-testid="sentinel-stock-highlight">
                <img src={SENTINEL_IMG} alt="Sentinel Lock" className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-1">Sentinel Lock — Stock</h3>
                  <div className="flex gap-3">
                    <span className="text-emerald-400 text-sm font-bold">{stock.summary?.sentinel_lock?.available || 0} disponibles</span>
                    <span className="text-amber-400 text-sm font-bold">{stock.summary?.sentinel_lock?.reserved || 0} reservados</span>
                    <span className="text-blue-400 text-sm font-bold">{stock.summary?.sentinel_lock?.sold || 0} vendidos</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Producto bajo pedido — Fabricacion 15-20 dias — 249 EUR/unidad</p>
                </div>
              </div>
              {/* Stock items list */}
              <div className="space-y-2">
                {stock.items?.map(item => (
                  <div key={item.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4" data-testid={`stock-${item.id}`}>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center flex-shrink-0">
                      {PRODUCT_IMGS[item.product_type] ? <img src={PRODUCT_IMGS[item.product_type]} alt={item.product_type} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-slate-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">{PRODUCT_LABELS[item.product_type] || item.product_type}</p>
                      <p className="text-slate-400 text-xs">S/N: {item.serial_number} | {item.model}</p>
                      {item.reserved_for && <p className="text-amber-400 text-[10px]">Reservado: {item.reserved_for}</p>}
                    </div>
                    <span className={`${STOCK_STATUS_COLORS[item.status] || 'bg-slate-500'} text-white text-[9px] px-2.5 py-1 rounded-full font-bold`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══ INSTALLATIONS ═══ */}
          {activeTab === 'installations' && (
            <div data-testid="installations-tab">
              <h2 className="text-white text-xl font-black mb-4">Instalaciones</h2>
              <div className="space-y-2">
                {installations.map(inst => (
                  <div key={inst.install_id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4" data-testid={`install-${inst.install_id}`}>
                    <Building2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-bold">{inst.client_name}</p>
                      <p className="text-slate-400 text-xs">{inst.address} | {inst.plan_type}</p>
                      <p className="text-slate-500 text-[10px]">Fecha: {inst.scheduled_date}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${inst.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : inst.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{inst.status}</span>
                  </div>
                ))}
                {installations.length === 0 && <p className="text-slate-500 text-sm text-center py-10">Sin instalaciones programadas</p>}
              </div>
            </div>
          )}

          {/* ════ CATALOGO TECNICO ════ */}
          {activeTab === 'catalog' && (
            <div className="space-y-4" data-testid="tab-catalog">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-indigo-400" /> Catalogo de Productos</h2>
                <span className="text-slate-500 text-xs">Fichas tecnicas para comerciales</span>
              </div>
              {[
                { id: 'alarm_home', name: 'Kit Alarma Hogar', category: 'Alarmas', price: '33.90', priceType: '/mes', img: '🏠', desc: 'Kit completo de alarma para hogar con panel central, 2 sensores PIR, 2 contactos magneticos, 1 sirena interior. Conexion 4G + WiFi.', features: ['Panel Sentinel X con pantalla tactil', 'Sensor PIR anti-mascotas (hasta 25kg)', 'Contacto magnetico puertas/ventanas', 'Sirena interior 110dB', 'Bateria backup 48h', 'Videovigilancia opcional'] },
                { id: 'alarm_biz', name: 'Kit Alarma Negocio', category: 'Alarmas', price: '54.90', priceType: '/mes', img: '🏢', desc: 'Solucion profesional para comercios y empresas. Incluye panel avanzado, sensores PIR de cortina, detectores de vibration, y modulo anti-inhibicion.', features: ['Panel Sentinel X Pro dual SIM', 'Sensor PIR cortina comercial', 'Detector vibracion anti-butrón', 'Modulo anti-inhibicion GSM/WiFi', 'Nebulizador de seguridad (opcional)', 'Boton de panico silencioso'] },
                { id: 'sentinel_lock', name: 'Sentinel Lock', category: 'Cerraduras', price: '249.00', priceType: ' (dispositivo)', img: '🔐', desc: 'Cerradura inteligente con IA de deteccion de intrusos. Apertura via app, huella, tarjeta NFC, o codigo PIN. Motor ultra-silencioso.', features: ['IA deteccion de intentos de intrusion', 'Apertura via App, Huella, NFC, PIN', 'Motor ultra-silencioso patentado', 'Bateria recargable 6 meses', 'Registro digital de accesos', 'Compatible con ManoConnect'] },
                { id: 'cam_4k', name: 'Camara MPC-4K Pro', category: 'Videovigilancia', price: '199.00', priceType: '', img: '📹', desc: 'Camara de videovigilancia 4K con vision nocturna a color, deteccion de personas IA, audio bidireccional y almacenamiento cloud.', features: ['Resolucion 4K Ultra HD', 'Vision nocturna a color 30m', 'Deteccion de personas con IA', 'Audio bidireccional', 'IP67 resistente exterior', 'Cloud storage incluido'] },
                { id: 'sentinel_sos', name: 'Sentinel SOS', category: 'SOS Personal', price: '9.99', priceType: '/mes', img: '🆘', desc: 'Dispositivo SOS personal con GPS, boton de panico, y comunicacion directa con la CRA. Ideal para personas mayores y profesionales.', features: ['Boton SOS con GPS integrado', 'Comunicacion directa con CRA 24/7', 'Deteccion de caidas automatica', 'Geolocalizacion en tiempo real', 'Autonomia 7 dias', 'Resistente al agua IP65'] },
                { id: 'sensor_pir', name: 'Sensor PIR-360', category: 'Sensores', price: '79.00', priceType: '', img: '📡', desc: 'Sensor de movimiento infrarrojo de 360 grados, anti-mascotas, con doble tecnologia PIR+Microondas para minimos falsos positivos.', features: ['Deteccion 360 grados', 'Anti-mascotas hasta 25kg', 'Doble tecnologia PIR + Microondas', 'Alcance 12 metros', 'Montaje techo/pared', 'Bateria 3 anos'] },
              ].map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* ════ REVISTA MANOPROTECT VISION ════ */}
          {activeTab === 'magazine' && (
            <div className="space-y-4" data-testid="tab-magazine">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-lg flex items-center gap-2"><Newspaper className="w-5 h-5 text-amber-400" /> ManoProtect Vision</h2>
                <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-[10px] font-bold border border-amber-500/20">Revista Digital Premium</span>
              </div>
              <p className="text-slate-400 text-xs">Herramienta comercial exclusiva para presentaciones en tablet con clientes potenciales.</p>

              <MagazineSection title="Por que ManoProtect" subtitle="Nuestra ventaja competitiva" color="indigo" items={[
                { title: 'Instalacion GRATIS', desc: 'A diferencia de Securitas Direct, no cobramos instalacion. El equipo se incluye sin coste adicional.' },
                { title: 'SIN Permanencia', desc: 'Contrato mensual sin penalizaciones. El cliente puede cancelar cuando quiera.' },
                { title: 'Precio Imbatible', desc: 'Desde 33,90 EUR/mes con tecnologia de ultima generacion. Mejor relacion calidad-precio del mercado.' },
                { title: 'CRA Propia 24/7', desc: 'Central Receptora de Alarmas propia en Valencia. Tiempo de respuesta medio: 15 segundos.' },
              ]} />

              <MagazineSection title="Comparativa vs Competencia" subtitle="Datos reales del mercado" color="emerald" items={[
                { title: 'vs Securitas Direct', desc: 'Securitas cobra 49,90 EUR/mes + 99 EUR instalacion + permanencia 36 meses. ManoProtect: desde 33,90 EUR/mes, instalacion GRATIS, sin permanencia.' },
                { title: 'vs ADT/Tyco', desc: 'ADT cobra 39,90 EUR/mes + 149 EUR instalacion. No incluye camaras. ManoProtect incluye videovigilancia HD desde el plan Essential.' },
                { title: 'vs Prosegur', desc: 'Prosegur desde 44,90 EUR/mes con permanencia 24 meses y equipo no incluido. ManoProtect: todo incluido sin sorpresas.' },
              ]} />

              <MagazineSection title="Casos de Exito" subtitle="Testimonios reales" color="amber" items={[
                { title: 'Restaurante El Faro — Valencia', desc: '"Desde que contratamos ManoProtect, tenemos vigilancia 24/7 con camaras HD. La nebulizadora nos salvo de un robo nocturno." — Antonio M., Propietario' },
                { title: 'Comunidad Villa Esmeralda — Paterna', desc: '"El Escudo Vecinal ha reducido los incidentes en un 78%. Los vecinos se sienten mucho mas seguros." — Junta de Propietarios' },
                { title: 'Clinica Dental Smile — Alicante', desc: '"La atencion del equipo tecnico es excepcional. Instalacion rapida y profesional. Lo recomiendo." — Dra. Martinez' },
              ]} />

              <MagazineSection title="Argumentario Comercial" subtitle="Claves para cerrar la venta" color="purple" items={[
                { title: 'Objecion: Es muy caro', desc: 'Respuesta: "Somos un 30% mas baratos que Securitas Direct y no hay permanencia. Si no le convence, puede cancelar manana sin coste."' },
                { title: 'Objecion: Ya tengo alarma', desc: 'Respuesta: "Que cuota paga actualmente? Con ManoProtect puede ahorrar hasta 200 EUR al ano con mejor tecnologia y sin permanencia."' },
                { title: 'Objecion: No me fio de marcas nuevas', desc: 'Respuesta: "Somos empresa espanola registrada con CRA propia homologada. Nuestros operadores estan en Valencia, no en un call center externo."' },
              ]} />
            </div>
          )}

        </main>
      </div>

      <LeadModal open={showLeadModal} onClose={() => setShowLeadModal(false)} onSubmit={createLead} />
      <CalendarEventModal open={showCalendarModal} onClose={() => setShowCalendarModal(false)} onSubmit={createCalendarEvent} />
      <StockModal open={showStockModal} onClose={() => setShowStockModal(false)} onSubmit={addStockItem} />
    </div>
  );
}
