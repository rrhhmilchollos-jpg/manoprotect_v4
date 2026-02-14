import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  Shield, Users, AlertTriangle, MessageSquare, BarChart3, 
  Download, Monitor, Smartphone, Search, Bell, Settings,
  ChevronRight, CheckCircle, Clock, XCircle, Send, RefreshCw,
  Circle, Wifi, WifiOff, User, Phone, Mail, MoreVertical,
  MessageCircle, Radio, Megaphone, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

// Componente de Chat entre empleados
const EmployeeChat = ({ currentUser, selectedEmployee, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedEmployee) {
      loadMessages();
    }
  }, [selectedEmployee]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await axios.get(
        `${API}/api/employees/messages?with_user=${selectedEmployee.user_id}`,
        { withCredentials: true }
      );
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API}/api/employees/messages/send`, {
        recipient_id: selectedEmployee.user_id,
        message: newMessage,
        message_type: 'text'
      }, { withCredentials: true });

      setMessages(prev => [...prev, {
        message_id: `temp_${Date.now()}`,
        sender_id: currentUser?.user_id,
        sender_name: currentUser?.name || 'Tú',
        message: newMessage,
        created_at: new Date().toISOString()
      }]);
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedEmployee) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-slate-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">{selectedEmployee.name}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Circle className={`w-2 h-2 ${
                  selectedEmployee.status === 'online' ? 'fill-emerald-500 text-emerald-500' :
                  selectedEmployee.status === 'away' ? 'fill-amber-500 text-amber-500' :
                  'fill-slate-500 text-slate-500'
                }`} />
                {selectedEmployee.status === 'online' ? 'En línea' : 
                 selectedEmployee.status === 'away' ? 'Ausente' : 'Desconectado'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-900/50">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Envía el primer mensaje</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.message_id}
                className={`flex ${msg.sender_id === currentUser?.user_id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender_id === currentUser?.user_id 
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-white rounded-bl-sm'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-slate-700 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-full flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Empleados Conectados
const ConnectedEmployees = ({ employees, onSelectEmployee, onRefresh, loading }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'online': return 'En línea';
      case 'away': return 'Ausente';
      case 'busy': return 'Ocupado';
      default: return 'Desconectado';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold">Empleados Conectados</h3>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            {employees.length}
          </span>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/50">
            <tr className="text-xs text-slate-400 uppercase">
              <th className="text-left p-3">Empleado</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Versión</th>
              <th className="text-left p-3">Última Conexión</th>
              <th className="text-left p-3">Dispositivo</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-500">
                  <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No hay empleados conectados
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.user_id} className="border-t border-slate-700/30 hover:bg-slate-700/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{emp.name}</p>
                        <p className="text-xs text-slate-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
                      emp.status === 'online' ? 'bg-emerald-500/20 text-emerald-400' :
                      emp.status === 'away' ? 'bg-amber-500/20 text-amber-400' :
                      emp.status === 'busy' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      <Circle className={`w-2 h-2 ${getStatusColor(emp.status)} rounded-full`} />
                      {getStatusText(emp.status)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      emp.app_version === '2.0.0' 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      v{emp.app_version || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-400">
                    {emp.last_activity 
                      ? new Date(emp.last_activity).toLocaleString('es-ES', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </td>
                  <td className="p-3">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      {emp.device?.includes('Android') ? <Smartphone className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
                      {emp.device || 'Desconocido'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectEmployee(emp)}
                        className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg text-emerald-400 transition-colors"
                        title="Enviar mensaje"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                        title="Más opciones"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de Mensajería Rápida (Panel lateral)
const QuickMessaging = ({ employees, currentUser, unreadCount }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">Mensajería Instantánea</h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
        {employees.filter(e => e.status === 'online').length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No hay empleados en línea
          </p>
        ) : (
          employees.filter(e => e.status === 'online').map((emp) => (
            <button
              key={emp.user_id}
              onClick={() => setSelectedChat(emp)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors text-left"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{emp.name}</p>
                <p className="text-xs text-slate-500">En línea</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
            </button>
          ))
        )}
      </div>

      {selectedChat && (
        <EmployeeChat
          currentUser={currentUser}
          selectedEmployee={selectedChat}
          onClose={() => setSelectedChat(null)}
        />
      )}
    </div>
  );
};

// Componente principal
export default function PortalEmpleados() {
  const [stats, setStats] = useState({
    total_threats: 0,
    resolved_today: 0,
    pending_tickets: 0,
    active_users: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [connectedEmployees, setConnectedEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    loadDashboardData();
    loadCurrentUser();
    loadConnectedEmployees();
    loadUnreadCount();
    
    // Polling para actualizar empleados conectados
    const interval = setInterval(() => {
      loadConnectedEmployees();
      loadUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await axios.get(`${API}/api/auth/me`, { withCredentials: true });
      setCurrentUser(res.data);
      
      // Conectar como empleado
      await connectAsEmployee(res.data);
    } catch (error) {
      console.log('No authenticated');
    }
  };

  const connectAsEmployee = async (user) => {
    try {
      await axios.post(`${API}/api/employees/connect`, {
        employee_id: user.user_id,
        device_info: navigator.userAgent.includes('Mobile') ? 'Mobile Web' : 'Desktop Web',
        app_version: '2.0.0'
      }, { withCredentials: true });
      setIsConnected(true);
    } catch (error) {
      console.log('Could not connect as employee');
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/api/fraud/public/scam-stats`),
        axios.get(`${API}/api/community-alerts`)
      ]);
      
      setStats({
        total_threats: statsRes.data.total_scams_blocked || 52847,
        resolved_today: statsRes.data.scams_today || 127,
        pending_tickets: 23,
        active_users: statsRes.data.protected_families || 10234
      });
      
      setRecentAlerts(alertsRes.data.alerts?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const loadConnectedEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const res = await axios.get(`${API}/api/employees/connected`, { withCredentials: true });
      setConnectedEmployees(res.data.employees || []);
    } catch (error) {
      console.log('Error loading employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const res = await axios.get(`${API}/api/employees/messages/unread`, { withCredentials: true });
      setUnreadMessages(res.data.unread_count || 0);
    } catch (error) {
      console.log('Error loading unread count');
    }
  };

  const downloads = [
    {
      platform: 'Windows',
      icon: <Monitor className="w-8 h-8" />,
      file: '/ManoProtect-Desktop-Windows.zip',
      size: '107 MB',
      version: '2.0.0',
      description: 'Para ordenadores de escritorio Windows 10/11',
      color: 'from-blue-500 to-blue-600'
    },
    {
      platform: 'Android',
      icon: <Smartphone className="w-8 h-8" />,
      file: '/ManoProtect-Android-Project.zip',
      size: '4.8 MB',
      version: '2.0.0',
      description: 'Para tablets y móviles Android de las sucursales',
      color: 'from-green-500 to-green-600',
      note: 'Requiere compilar con Android Studio'
    }
  ];

  const features = [
    { icon: <BarChart3 />, title: 'Dashboard', desc: 'Estadísticas en tiempo real' },
    { icon: <AlertTriangle />, title: 'Gestión de Amenazas', desc: 'Ver, asignar y resolver' },
    { icon: <Users />, title: 'Clientes', desc: 'Administrar cuentas' },
    { icon: <Search />, title: 'Verificador', desc: 'Analizar contenido sospechoso' },
    { icon: <MessageSquare />, title: 'Mensajería', desc: 'Chat entre empleados' },
    { icon: <Bell />, title: 'Alertas', desc: 'Enviar alertas masivas' },
  ];

  return (
    <>
      <Helmet>
        <title>Portal de Empleados - ManoProtect</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-emerald-400">ManoProtect</span>
                <span className="text-xs block text-slate-400">Portal de Empleados</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs ${
                isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isConnected ? 'Conectado' : 'Desconectado'}
              </div>
              
              {/* Unread Messages */}
              {unreadMessages > 0 && (
                <div className="relative">
                  <MessageCircle className="w-5 h-5 text-slate-400" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">
                    {unreadMessages}
                  </span>
                </div>
              )}
              
              <span className="text-sm text-slate-400">{currentUser?.name || 'STARTBOOKING SL'}</span>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Amenazas Bloqueadas', value: stats.total_threats.toLocaleString(), icon: <Shield />, color: 'emerald' },
              { label: 'Resueltas Hoy', value: stats.resolved_today, icon: <CheckCircle />, color: 'blue' },
              { label: 'Tickets Pendientes', value: stats.pending_tickets, icon: <Clock />, color: 'amber' },
              { label: 'Empleados Online', value: connectedEmployees.filter(e => e.status === 'online').length, icon: <Users />, color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center mb-3`}>
                  <span className={`text-${stat.color}-400`}>{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Empleados Conectados y Versiones */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-400" />
              Empleados Conectados y Versiones
            </h2>
            <ConnectedEmployees
              employees={connectedEmployees}
              onSelectEmployee={setSelectedEmployee}
              onRefresh={loadConnectedEmployees}
              loading={loadingEmployees}
            />
          </div>

          {/* Grid: Mensajería + Descargas */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Mensajería Instantánea */}
            <div className="lg:col-span-1">
              <QuickMessaging 
                employees={connectedEmployees}
                currentUser={currentUser}
                unreadCount={unreadMessages}
              />
            </div>

            {/* Downloads Section */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-400" />
                Descargas para Sucursales
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {downloads.map((dl, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
                    <div className={`bg-gradient-to-r ${dl.color} p-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                          {dl.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{dl.platform}</h3>
                          <p className="text-xs opacity-90">v{dl.version} • {dl.size}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-300 mb-3">{dl.description}</p>
                      <a
                        href={dl.file}
                        download
                        className="inline-flex items-center gap-2 w-full justify-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Funcionalidades</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {features.map((feat, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mx-auto mb-2">
                    {feat.icon}
                  </div>
                  <h4 className="font-medium text-sm">{feat.title}</h4>
                  <p className="text-xs text-slate-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Alertas Recientes
            </h2>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
              {recentAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No hay alertas recientes
                </div>
              ) : (
                recentAlerts.map((alert, i) => (
                  <div key={i} className={`p-4 flex items-center justify-between ${i !== recentAlerts.length - 1 ? 'border-b border-slate-700/50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">{alert.threat_type}</p>
                        <p className="text-sm text-slate-400 line-clamp-1">{alert.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-slate-500 text-sm">
            <p>Manoprotect.com</p>
            <p className="mt-1">© 2024 ManoProtect - Portal Interno de Empleados</p>
          </div>
        </main>

        {/* Chat Modal */}
        {selectedEmployee && (
          <EmployeeChat
            currentUser={currentUser}
            selectedEmployee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
      </div>
    </>
  );
}
