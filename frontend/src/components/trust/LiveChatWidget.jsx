import React, { useState } from 'react';
import { MessageCircle, Phone, Clock, Send, User, X, Headphones } from 'lucide-react';

/**
 * Live Chat Widget - Chat con persona real
 * Alternativa al chat IA para quienes prefieren hablar con humanos
 */
const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatMode, setChatMode] = useState('select'); // 'select', 'chat', 'callback'
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [callbackForm, setCallbackForm] = useState({ name: '', phone: '', time: 'morning' });

  const agents = [
    { name: "María López", status: "online", avatar: "ML", specialty: "Soporte General" },
    { name: "Carlos García", status: "online", avatar: "CG", specialty: "Planes Empresas" },
    { name: "Ana Ruiz", status: "busy", avatar: "AR", specialty: "Soporte Técnico" },
  ];

  const availableAgents = agents.filter(a => a.status === 'online').length;

  const handleStartChat = () => {
    setChatMode('chat');
    setMessages([
      {
        id: 1,
        type: 'system',
        text: 'Conectando con un agente...',
        time: new Date()
      },
      {
        id: 2,
        type: 'agent',
        agent: agents[0],
        text: '¡Hola! Soy María del equipo de ManoProtect. ¿En qué puedo ayudarte hoy?',
        time: new Date()
      }
    ]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    setMessages(prev => [...prev, {
      id: prev.length + 1,
      type: 'user',
      text: inputValue,
      time: new Date()
    }]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        type: 'agent',
        agent: agents[0],
        text: 'Gracias por tu mensaje. Déjame revisar eso por ti...',
        time: new Date()
      }]);
    }, 2000);
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    setChatMode('callback-confirmed');
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all group"
      >
        <Headphones className="w-5 h-5" />
        <span className="font-medium">Hablar con Humano</span>
        {availableAgents > 0 && (
          <span className="flex items-center gap-1 text-xs bg-emerald-700 text-white px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {availableAgents} online
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Headphones className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold">Soporte Humano</p>
                <p className="text-indigo-200 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  {availableAgents} agentes disponibles
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="h-96">
            {chatMode === 'select' && (
              <div className="p-6 space-y-4">
                <p className="text-slate-600 text-center mb-6">¿Cómo prefieres contactarnos?</p>
                
                <button
                  onClick={handleStartChat}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Chat en Vivo</p>
                    <p className="text-sm text-slate-500">Respuesta inmediata</p>
                  </div>
                </button>

                <button
                  onClick={() => setChatMode('callback')}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Te Llamamos</p>
                    <p className="text-sm text-slate-500">Elige tu horario</p>
                  </div>
                </button>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 text-center">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Horario: Lun-Vie 9:00-20:00 | Sáb 10:00-14:00
                  </p>
                </div>

                {/* Available agents */}
                <div className="pt-4">
                  <p className="text-xs text-slate-500 mb-3">Agentes disponibles:</p>
                  <div className="flex -space-x-2">
                    {agents.map((agent, i) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white ${
                          agent.status === 'online' ? 'bg-indigo-500' : 'bg-slate-400'
                        }`}
                        title={`${agent.name} - ${agent.status}`}
                      >
                        {agent.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chatMode === 'chat' && (
              <div className="h-full flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'agent' && (
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0">
                          {msg.agent.avatar}
                        </div>
                      )}
                      <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
                        msg.type === 'user' 
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : msg.type === 'system'
                            ? 'bg-slate-100 text-slate-500 text-center text-xs'
                            : 'bg-slate-100 text-slate-700 rounded-bl-md'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 px-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="w-10 h-10 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {chatMode === 'callback' && (
              <form onSubmit={handleCallbackSubmit} className="p-6 space-y-4">
                <p className="text-slate-600 text-center mb-4">Déjanos tus datos y te llamamos</p>
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={callbackForm.name}
                    onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={callbackForm.phone}
                    onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-600 mb-1">Horario preferido</label>
                  <select
                    value={callbackForm.time}
                    onChange={(e) => setCallbackForm({ ...callbackForm, time: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="morning">Mañana (9:00 - 13:00)</option>
                    <option value="afternoon">Tarde (15:00 - 18:00)</option>
                    <option value="evening">Noche (18:00 - 20:00)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Solicitar Llamada
                </button>

                <button
                  type="button"
                  onClick={() => setChatMode('select')}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm"
                >
                  Volver
                </button>
              </form>
            )}

            {chatMode === 'callback-confirmed' && (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Recibido!</h3>
                <p className="text-slate-600 mb-6">
                  Te llamaremos en el horario seleccionado. Gracias por contactarnos.
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LiveChatWidget;
