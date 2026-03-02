import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Phone, Mail, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const QUICK_REPLIES = [
  { text: 'Precios alarmas hogar', key: 'precios-hogar' },
  { text: 'Precios alarmas negocio', key: 'precios-negocio' },
  { text: 'Sentinel SOS', key: 'sentinel' },
  { text: 'Escudo Vecinal', key: 'vecinal' },
  { text: 'Hablar con un asesor', key: 'asesor' },
];

const RESPONSES = {
  'precios-hogar': {
    text: 'Nuestras alarmas para vivienda:\n\n**Essential** (pisos): 33,90 EUR/mes\n**Premium** (chalets/casas): 44,90 EUR/mes\n\nInstalacion profesional GRATIS. SIN permanencia. Sentinel SOS incluido.\n\n¿Te interesa alguno?',
    followUp: [{ text: 'Quiero Essential', key: 'interes-essential' }, { text: 'Quiero Premium', key: 'interes-premium' }, { text: 'Ver mas detalles', key: 'link-alarmas' }],
  },
  'precios-negocio': {
    text: 'Alarmas para negocios:\n\n**Comercio** (tiendas/locales): 54,90 EUR/mes\n**Empresa** (naves/oficinas): 74,90 EUR/mes\n\nInstalacion profesional GRATIS. Camaras 4K IA. Control acceso biometrico. Servicio Acuda.\n\n¿Cual se adapta a tu negocio?',
    followUp: [{ text: 'Quiero Comercio', key: 'interes-comercio' }, { text: 'Quiero Empresa', key: 'interes-empresa' }, { text: 'Ver mas detalles', key: 'link-negocio' }],
  },
  'sentinel': {
    text: 'Sentinel SOS - dispositivos wearables de emergencia:\n\n**Sentinel X** (smartwatch): 199 EUR + desde 9,99 EUR/mes\n**Sentinel J** (junior): 79 EUR\n**Sentinel S** (senior): 103 EUR\n\nGPS, boton SOS, deteccion caidas. Funcionan de forma independiente.',
    followUp: [{ text: 'Me interesa Sentinel X', key: 'interes-sentinel' }, { text: 'Ver todos los planes', key: 'link-plans' }],
  },
  'vecinal': {
    text: 'El **Escudo Vecinal Premium** protege tu barrio contra okupaciones y robos en tiempo real.\n\n299,99 EUR/ano por familia. Plan INDEPENDIENTE (no necesitas alarma). Alertas push, mapa de incidencias, coordinacion vecinal.\n\nRefiere vecinos = 1 mes gratis.',
    followUp: [{ text: 'Me interesa', key: 'interes-vecinal' }, { text: 'Ver Dashboard Barrio', key: 'link-barrio' }],
  },
  'asesor': {
    text: 'Un asesor de seguridad te llamara en menos de 24h. Dejame tus datos:',
    captureForm: true,
  },
  'interes-essential': { text: 'Genial eleccion. Para prepararte un presupuesto personalizado necesito unos datos:', captureForm: true },
  'interes-premium': { text: 'El Premium es nuestro mas vendido. Para prepararte un presupuesto:', captureForm: true },
  'interes-comercio': { text: 'Perfecto para tu negocio. Dejame tus datos para un presupuesto:', captureForm: true },
  'interes-empresa': { text: 'Seguridad total para tu empresa. Necesito unos datos:', captureForm: true },
  'interes-sentinel': { text: 'Excelente. Dejame tus datos y te contactamos:', captureForm: true },
  'interes-vecinal': { text: 'Tu barrio estara mas seguro. Dejame tus datos:', captureForm: true },
  'link-alarmas': { text: 'Puedes ver todos los detalles en nuestra pagina de alarmas para vivienda.', link: '/alarmas/vivienda' },
  'link-negocio': { text: 'Aqui tienes toda la informacion sobre alarmas para negocios.', link: '/alarmas/negocio' },
  'link-plans': { text: 'Mira todos nuestros planes y precios aqui:', link: '/plans' },
  'link-barrio': { text: 'Consulta las estadisticas de tu barrio en el Dashboard:', link: '/dashboard-barrio' },
};

function matchFreeText(text) {
  const t = text.toLowerCase();
  if (t.includes('precio') || t.includes('cuanto') || t.includes('coste') || t.includes('cuota')) {
    if (t.includes('negocio') || t.includes('empresa') || t.includes('local') || t.includes('tienda')) return 'precios-negocio';
    return 'precios-hogar';
  }
  if (t.includes('sentinel') || t.includes('reloj') || t.includes('sos') || t.includes('caida')) return 'sentinel';
  if (t.includes('vecinal') || t.includes('barrio') || t.includes('okupacion') || t.includes('comunidad')) return 'vecinal';
  if (t.includes('alarma') && (t.includes('negocio') || t.includes('empresa'))) return 'precios-negocio';
  if (t.includes('alarma') || t.includes('camara') || t.includes('sensor') || t.includes('hogar') || t.includes('casa') || t.includes('piso') || t.includes('chalet')) return 'precios-hogar';
  if (t.includes('asesor') || t.includes('llamar') || t.includes('contacto') || t.includes('hablar') || t.includes('presupuesto')) return 'asesor';
  if (t.includes('instalacion') || t.includes('instalar')) return { text: 'La instalacion profesional es completamente GRATIS en todos nuestros planes. Un tecnico certificado instala todo el equipo en tu vivienda o negocio. SIN permanencia.', followUp: QUICK_REPLIES.slice(0, 3) };
  if (t.includes('permanencia') || t.includes('contrato') || t.includes('cancelar')) return { text: 'En ManoProtect NO hay permanencia. Puedes cancelar en cualquier momento sin penalizacion. Sin letra pequena, sin sorpresas.' };
  if (t.includes('referido') || t.includes('descuento') || t.includes('codigo')) return { text: 'Con nuestro sistema de referidos, cuando un amigo o vecino contrata cualquier plan de ManoProtect, ambos recibis 1 mes GRATIS. Sin limite de referidos.' };
  if (t.includes('hola') || t.includes('buenas') || t.includes('buenos')) return { text: 'Hola! Soy el asistente de ManoProtect. ¿En que puedo ayudarte? Puedo informarte sobre precios, productos o ponerte en contacto con un asesor.' , followUp: QUICK_REPLIES };
  return null;
}

function LeadForm({ onSubmit, saving }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-2 mt-2">
      <input type="text" placeholder="Tu nombre" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" data-testid="chat-lead-name" />
      <input type="tel" placeholder="Telefono *" required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" data-testid="chat-lead-phone" />
      <input type="email" placeholder="Email (opcional)" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" data-testid="chat-lead-email" />
      <button type="submit" disabled={saving}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors" data-testid="chat-lead-submit">
        {saving ? 'Enviando...' : 'Solicitar contacto'}
      </button>
    </form>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hola! Soy el asistente de ManoProtect. ¿En que puedo ayudarte?', followUp: QUICK_REPLIES },
  ]);
  const [input, setInput] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formContext, setFormContext] = useState('');
  const [saving, setSaving] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const scrollRef = useRef(null);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, showForm]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000);
    return () => clearTimeout(t);
  }, []);

  const handleReply = (key) => {
    const resp = RESPONSES[key];
    if (!resp) return;
    setMessages(m => [...m, { from: 'user', text: QUICK_REPLIES.find(q => q.key === key)?.text || key }]);

    if (resp.captureForm) {
      setMessages(m => [...m, { from: 'bot', text: resp.text }]);
      setShowForm(true);
      setFormContext(key);
      return;
    }
    if (resp.link) {
      setMessages(m => [...m, { from: 'bot', text: resp.text, link: resp.link }]);
      return;
    }
    setMessages(m => [...m, { from: 'bot', text: resp.text, followUp: resp.followUp }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    setMessages(m => [...m, { from: 'user', text: userText }]);

    const match = matchFreeText(userText);
    if (match && typeof match === 'string') {
      const resp = RESPONSES[match];
      if (resp.captureForm) {
        setMessages(m => [...m, { from: 'bot', text: resp.text }]);
        setShowForm(true);
        setFormContext(match);
      } else {
        setMessages(m => [...m, { from: 'bot', text: resp.text, followUp: resp.followUp, link: resp.link }]);
      }
    } else if (match && typeof match === 'object') {
      setMessages(m => [...m, { from: 'bot', text: match.text, followUp: match.followUp }]);
    } else {
      setMessages(m => [...m, { from: 'bot', text: 'Entiendo. ¿Puedo ayudarte con informacion sobre nuestros productos o ponerte en contacto con un asesor?', followUp: QUICK_REPLIES }]);
    }
  };

  const handleLeadSubmit = async (form) => {
    setSaving(true);
    try {
      await fetch(`${API}/api/enterprise-central/leads`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email || `${form.phone}@chat.manoprotect.com`, phone: form.phone, source: 'chatbot', interest: formContext, notes: `Lead captado via chatbot web. Contexto: ${formContext}` }),
      });
      setShowForm(false);
      setLeadSent(true);
      setMessages(m => [...m, { from: 'bot', text: 'Perfecto, ' + form.name + '! Un asesor de seguridad te contactara en menos de 24 horas al ' + form.phone + '. Gracias por confiar en ManoProtect.' }]);
    } catch {
      setMessages(m => [...m, { from: 'bot', text: 'Ha habido un error. Puedes llamarnos directamente al 601 510 950.' }]);
    }
    setSaving(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button onClick={() => { setOpen(true); setPulse(false); }}
          className={`fixed bottom-5 right-5 z-[80] w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${pulse ? 'animate-bounce' : ''}`}
          data-testid="chat-open-btn" aria-label="Abrir chat de ayuda">
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-5 right-5 z-[80] w-[340px] sm:w-[380px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" data-testid="chat-window">
          {/* Header */}
          <div className="bg-emerald-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
              <div>
                <span className="text-white font-bold text-sm block">ManoProtect</span>
                <span className="text-white/70 text-[10px]">Respuesta inmediata</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" data-testid="chat-close-btn" aria-label="Cerrar chat"><X className="w-5 h-5" /></button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50" style={{ minHeight: '280px', maxHeight: '360px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.from === 'user' ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800 border border-gray-200'} rounded-2xl px-3.5 py-2.5 text-sm shadow-sm`}>
                  <div className="whitespace-pre-line" style={{ lineHeight: '1.5' }}>
                    {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                  </div>
                  {msg.link && (
                    <a href={msg.link} className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold mt-2 hover:underline" data-testid={`chat-link-${i}`}>
                      Ver pagina <ChevronRight className="w-3 h-3" />
                    </a>
                  )}
                  {msg.followUp && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {msg.followUp.map(q => (
                        <button key={q.key} onClick={() => handleReply(q.key)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                          data-testid={`quick-${q.key}`}>
                          {q.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {showForm && !leadSent && <LeadForm onSubmit={handleLeadSubmit} saving={saving} />}
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-2.5 flex gap-2 bg-white flex-shrink-0">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none" data-testid="chat-input" />
            <button onClick={handleSend} className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0" data-testid="chat-send-btn" aria-label="Enviar mensaje">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
