import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, ChevronUp, Search, ArrowRight, HelpCircle, MessageCircle, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const FAQ = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "General",
      questions: [
        {
          q: "¿Qué es ManoProtect?",
          a: "ManoProtect es una plataforma de seguridad digital que protege a familias y empresas contra fraudes, phishing, smishing, vishing y otras estafas digitales. Utilizamos inteligencia artificial avanzada para analizar mensajes, correos y enlaces sospechosos en tiempo real."
        },
        {
          q: "¿Cómo funciona la detección de fraudes?",
          a: "Nuestro sistema analiza el contenido que nos envías utilizando algoritmos de IA entrenados con miles de ejemplos de fraudes reales. Identificamos patrones como URLs sospechosas, lenguaje de urgencia, solicitudes de datos personales, errores gramaticales típicos de estafas, y más de 50 indicadores diferentes."
        },
        {
          q: "¿Es seguro compartir mis mensajes con ManoProtect?",
          a: "Absolutamente. Todos los datos son encriptados de extremo a extremo y se procesan en servidores ubicados en la Unión Europea. No almacenamos los mensajes analizados más tiempo del necesario y nunca compartimos tu información con terceros. Cumplimos con el RGPD y todas las normativas europeas de protección de datos."
        },
        {
          q: "¿ManoProtect puede ver mis contraseñas o datos bancarios?",
          a: "No. ManoProtect solo analiza el texto que tú decides compartir con nosotros. Nunca solicitamos contraseñas, números de tarjeta ni datos bancarios. Si alguien te pide estos datos haciéndose pasar por ManoProtect, es una estafa."
        }
      ]
    },
    {
      category: "Planes y Precios",
      questions: [
        {
          q: "¿Qué incluye el plan gratuito?",
          a: "El plan gratuito incluye análisis básicos de mensajes sospechosos, acceso a nuestra base de conocimiento sobre fraudes, alertas de nuevas amenazas, y hasta 5 análisis diarios. Es perfecto para empezar a protegerte."
        },
        {
          q: "¿Cuál es la diferencia entre el plan Individual y el Familiar?",
          a: "El plan Individual protege a una sola persona con análisis ilimitados. El plan Familiar permite proteger hasta 5 miembros de tu familia, incluye un modo especial para personas mayores con interfaz simplificada, localización de menores, y botón SOS de emergencia."
        },
        {
          q: "¿Puedo cancelar mi suscripción en cualquier momento?",
          a: "Sí, puedes cancelar tu suscripción cuando quieras desde tu panel de control. No hay permanencia ni penalizaciones. Si cancelas, mantendrás el acceso hasta el final del período de facturación."
        },
        {
          q: "¿Ofrecen garantía de devolución?",
          a: "Sí, ofrecemos garantía de satisfacción de 7 días. Si no estás satisfecho con el servicio, puedes solicitar un reembolso completo sin preguntas."
        },
        {
          q: "¿Los precios incluyen IVA?",
          a: "Sí, todos los precios mostrados incluyen IVA. El importe que ves es el importe final que pagarás."
        }
      ]
    },
    {
      category: "Protección Familiar",
      questions: [
        {
          q: "¿Cómo funciona el modo para personas mayores?",
          a: "El modo para mayores ofrece una interfaz simplificada con botones más grandes, textos más claros y menos opciones para evitar confusiones. También puedes configurar alertas automáticas que te avisen cuando un familiar mayor reciba un mensaje sospechoso."
        },
        {
          q: "¿Puedo ver la actividad de mis familiares?",
          a: "Sí, como administrador del plan familiar puedes ver un resumen de amenazas detectadas para cada miembro. Sin embargo, respetamos la privacidad: no puedes leer el contenido exacto de sus mensajes, solo los resultados del análisis."
        },
        {
          q: "¿Cómo funciona el botón SOS?",
          a: "El botón SOS permite a cualquier miembro de la familia enviar una alerta de emergencia a todos los demás miembros. Se envía la ubicación actual y una notificación push instantánea. Es ideal para situaciones donde sospechas que estás siendo víctima de una estafa en persona."
        }
      ]
    },
    {
      category: "Técnico",
      questions: [
        {
          q: "¿ManoProtect funciona en mi móvil?",
          a: "Sí, ManoProtect funciona en cualquier dispositivo con navegador web moderno: móviles Android e iOS, tablets, y ordenadores. También puedes instalar nuestra app desde Google Play Store para una experiencia optimizada en Android."
        },
        {
          q: "¿Necesito instalar algún software especial?",
          a: "No, ManoProtect funciona directamente desde tu navegador web. No necesitas instalar nada, aunque recomendamos añadir la página a tu pantalla de inicio para acceso rápido. También tenemos app nativa para Android."
        },
        {
          q: "¿Qué hago si detecto un falso positivo?",
          a: "Si crees que hemos marcado como peligroso un mensaje que es legítimo, puedes reportarlo desde el panel de resultados. Nuestro equipo lo revisará y mejorará el sistema. Los falsos positivos son raros (<0.5%) pero nos ayudan a mejorar."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleQuestion = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/manoprotect_logo.png" 
              alt="ManoProtect Logo" 
              className="h-8 w-auto" 
            />
            <span className="text-xl font-bold">ManoProtect</span>
          </div>
          <Button onClick={() => navigate('/pricing')} className="bg-indigo-600 hover:bg-indigo-700">
            Ver Planes
          </Button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Preguntas Frecuentes</h1>
          <p className="text-xl text-indigo-100 mb-8">
            Encuentra respuestas a las preguntas más comunes sobre ManoProtect
          </p>
          
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <Input
              type="text"
              placeholder="Buscar pregunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-white text-zinc-900 border-0"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {filteredFaqs.map((category, categoryIdx) => (
          <div key={categoryIdx} className="mb-10">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 font-bold text-sm">{categoryIdx + 1}</span>
              </div>
              {category.category}
            </h2>
            
            <div className="space-y-3">
              {category.questions.map((faq, questionIdx) => {
                const key = `${categoryIdx}-${questionIdx}`;
                const isOpen = openIndex === key;
                
                return (
                  <Card 
                    key={questionIdx}
                    className={`cursor-pointer transition-all ${isOpen ? 'ring-2 ring-indigo-500 shadow-md' : 'hover:shadow-md'}`}
                    onClick={() => toggleQuestion(categoryIdx, questionIdx)}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-5">
                        <h3 className="font-semibold text-zinc-900 pr-4">{faq.q}</h3>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                        )}
                      </div>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-0">
                          <div className="border-t pt-4">
                            <p className="text-zinc-600 leading-relaxed">{faq.a}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-700 mb-2">No encontramos resultados</h3>
            <p className="text-zinc-500">Prueba con otros términos de búsqueda</p>
          </div>
        )}

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">¿No encuentras lo que buscas?</h3>
            <p className="text-zinc-600 mb-6">
              Nuestro equipo de soporte está disponible para ayudarte con cualquier duda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:soporte@manoprotect.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                soporte@manoprotect.com
              </a>
              <a 
                href="tel:+34601510950"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Phone className="w-5 h-5" />
                +34 601 510 950
              </a>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-zinc-900 mb-4">¿Listo para protegerte?</h3>
          <p className="text-zinc-600 mb-6">
            Únete a miles de usuarios que ya confían en ManoProtect
          </p>
          <Button 
            onClick={() => navigate('/registro')}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-6 text-lg"
          >
            Empezar Gratis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-zinc-900 text-zinc-400 py-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm">
            © 2026 ManoProtect - STARTBOOKING SL (CIF: B19427723)
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="/privacy-policy" className="hover:text-white">Privacidad</a>
            <a href="/terms-of-service" className="hover:text-white">Términos</a>
            <a href="/legal-notice" className="hover:text-white">Aviso Legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;
