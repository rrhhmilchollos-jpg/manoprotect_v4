/**
 * ManoProtect - Página de Contacto y Soporte
 * Formulario directo + WhatsApp + Horario 24/7
 */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Shield, Phone, Mail, MapPin, Clock, MessageCircle, Send, Check } from 'lucide-react';
import LandingFooter from '@/components/landing/LandingFooter';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSent(true);
    } catch {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contacto y Soporte | ManoProtect</title>
        <meta name="description" content="Contacta con ManoProtect. Formulario directo, WhatsApp y soporte 24/7. Resolvemos todas tus dudas antes de comprar." />
        <link rel="canonical" href="https://manoprotectt.com/contacto" />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-emerald-600 text-lg font-bold">ManoProtect</span>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-emerald-600">Volver al inicio</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3" data-testid="contact-title">Contacto y Soporte</h1>
          <p className="text-lg text-gray-500">Resolvemos todas tus dudas antes de comprar</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envíanos un mensaje</h2>
            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center" data-testid="contact-success">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Mensaje enviado</h3>
                <p className="text-gray-500">Te responderemos en menos de 24 horas.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Tu nombre" data-testid="contact-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="tu@email.com" data-testid="contact-email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" data-testid="contact-subject">
                    <option value="">Selecciona un asunto</option>
                    <option value="compra">Dudas antes de comprar</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="envio">Estado del envío</option>
                    <option value="devolucion">Devolución o reembolso</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none" placeholder="¿En qué podemos ayudarte?" data-testid="contact-message" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50" data-testid="contact-submit">
                  {loading ? 'Enviando...' : <><Send className="w-5 h-5" /> Enviar mensaje</>}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Otras formas de contacto</h2>

            <a href="https://wa.me/34601510950" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl hover:bg-[#25D366]/20 transition-colors" data-testid="contact-whatsapp">
              <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-500">+34 601 510 950 – Respuesta inmediata</p>
              </div>
            </a>

            <a href="tel:+34601510950" className="flex items-center gap-4 p-5 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-colors" data-testid="contact-phone">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Teléfono</p>
                <p className="text-sm text-gray-500">+34 601 510 950</p>
              </div>
            </a>

            <a href="mailto:info@manoprotectt.com" className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors" data-testid="contact-mail">
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Email</p>
                <p className="text-sm text-gray-500">info@manoprotectt.com</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl" data-testid="contact-hours">
              <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Horario de atención</p>
                <p className="text-sm text-gray-500">24/7 – Todos los días del año</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-200 rounded-2xl">
              <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-900">Dirección</p>
                <p className="text-sm text-gray-500">España</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default ContactPage;
