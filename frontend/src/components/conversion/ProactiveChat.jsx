import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

/**
 * Proactive Chat - Chat que aparece automáticamente ofreciendo ayuda
 * Se activa después de X segundos en la página
 */
const ProactiveChat = ({ 
  delaySeconds = 30,
  triggerOnPricing = true 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const proactiveMessages = [
    "👋 ¡Hola! ¿Tienes dudas sobre qué plan elegir?",
    "Estoy aquí para ayudarte a encontrar la mejor protección para ti y tu familia.",
    "Puedo responder cualquier pregunta sobre ManoProtect. 🛡️"
  ];

  const quickReplies = [
    "¿Cuál es el mejor plan para mí?",
    "¿Cómo funciona la protección?",
    "¿Puedo probarlo gratis?",
    "¿Protege a toda mi familia?"
  ];

  useEffect(() => {
    // Check if already shown
    const shown = sessionStorage.getItem('proactiveChatShown');
    if (shown) {
      setHasTriggered(true);
      return;
    }

    // Check if on pricing page for immediate trigger
    const isPricing = window.location.pathname.includes('pricing');
    const delay = isPricing && triggerOnPricing ? 10000 : delaySeconds * 1000;

    const timer = setTimeout(() => {
      if (!hasTriggered) {
        setShowBubble(true);
        setHasTriggered(true);
        sessionStorage.setItem('proactiveChatShown', 'true');
        
        // Initialize with proactive messages
        setMessages(proactiveMessages.map((text, i) => ({
          id: i,
          type: 'bot',
          text,
          time: new Date()
        })));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delaySeconds, hasTriggered, triggerOnPricing]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBubble(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length,
      type: 'user',
      text: text.trim(),
      time: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponses = getBotResponse(text.trim());
      const botMessage = {
        id: messages.length + 1,
        type: 'bot',
        text: botResponses,
        time: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (question) => {
    const q = question.toLowerCase();
    
    if (q.includes('plan') || q.includes('mejor') || q.includes('recomienda')) {
      return "🎯 Para recomendarte el mejor plan, te sugiero usar nuestro cuestionario rápido. Pero en general:\n\n• **Plan Personal** (€9.99/mes): Ideal si solo te proteges tú\n• **Plan Familiar** (€29.99/mes): Perfecto para familias de hasta 5 personas\n• **Plan Enterprise** (€99.99/mes): Para familias grandes o empresas\n\n¡Todos incluyen 7 días de prueba gratis!";
    }
    
    if (q.includes('funciona') || q.includes('cómo')) {
      return "🛡️ ManoProtect usa Inteligencia Artificial para analizar:\n\n1. **Emails sospechosos** - Detectamos phishing al instante\n2. **SMS fraudulentos** - Analizamos enlaces peligrosos\n3. **Llamadas** - Te alertamos de números reportados\n4. **Protección familiar** - Conecta a toda tu familia\n\n¿Te gustaría probarlo gratis?";
    }
    
    if (q.includes('gratis') || q.includes('prueba') || q.includes('probar')) {
      return "🎁 ¡Sí! Todos nuestros planes incluyen **7 días de prueba GRATIS**.\n\nNo necesitas tarjeta de crédito para empezar. Puedes cancelar cuando quieras sin ningún compromiso.\n\n👉 ¿Quieres activar tu prueba ahora?";
    }
    
    if (q.includes('familia') || q.includes('padres') || q.includes('hijos')) {
      return "👨‍👩‍👧‍👦 ¡El Plan Familiar es perfecto para esto!\n\nIncluye:\n• Hasta 5 miembros protegidos\n• Alertas compartidas en tiempo real\n• Botón SOS de emergencia\n• Protección especial para mayores\n• Dashboard familiar\n\nEs ideal para proteger a padres mayores que no dominan la tecnología. 💪";
    }
    
    return "Gracias por tu pregunta. Para darte la mejor respuesta, te recomiendo visitar nuestra página de precios o contactar con nuestro equipo de soporte.\n\n¿Hay algo más específico en lo que pueda ayudarte? 🤔";
  };

  const handleQuickReply = (reply) => {
    handleSend(reply);
  };

  if (!showBubble && !isOpen) return null;

  return (
    <>
      {/* Chat bubble notification */}
      {showBubble && !isOpen && (
        <div className="fixed bottom-24 right-4 z-50 animate-bounce-in">
          <button
            onClick={handleOpen}
            className="flex items-start gap-3 max-w-xs bg-white rounded-2xl shadow-2xl p-4 border border-slate-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-slate-800 text-sm font-medium">
                👋 ¿Tienes dudas sobre qué plan elegir?
              </p>
              <p className="text-emerald-600 text-xs mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Te ayudo gratis
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </button>
        </div>
      )}

      {/* Full chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Asistente ManoProtect</p>
                <p className="text-emerald-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                  En línea
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-slate-50">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                className={`mb-3 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                    msg.type === 'user' 
                      ? 'bg-emerald-500 text-white rounded-br-md' 
                      : 'bg-white text-slate-700 rounded-bl-md shadow-sm border border-slate-100'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 4 && (
            <div className="px-4 py-2 bg-white border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-2">Preguntas frecuentes:</p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-700 text-xs rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSend()}
                className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default ProactiveChat;
