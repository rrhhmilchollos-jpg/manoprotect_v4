import { useState, useEffect } from 'react';
import { MessageCircle, Send, Loader2, Phone, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const WhatsAppManager = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const response = await fetch(`${API}/whatsapp/queue`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setQueue(data);
      }
    } catch (error) {
      console.error('Error loading queue:', error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const sendMessage = async () => {
    if (!phone.trim() || !message.trim()) {
      toast.error('Teléfono y mensaje son obligatorios');
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`${API}/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          phone_number: phone.trim(),
          message: message.trim()
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.queued) {
          toast.info('Mensaje añadido a la cola (WhatsApp API no configurada)');
        } else {
          toast.success('Mensaje enviado correctamente');
        }
        setPhone('');
        setMessage('');
        loadQueue();
      } else {
        toast.error(data.detail || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'sent':
        return <Badge className="bg-emerald-500"><CheckCircle className="w-3 h-3 mr-1" /> Enviado</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500"><Clock className="w-3 h-3 mr-1" /> Pendiente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><AlertTriangle className="w-3 h-3 mr-1" /> Fallido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" data-testid="whatsapp-manager">
      {/* Send Message Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Enviar Mensaje WhatsApp
          </CardTitle>
          <CardDescription>
            Envía alertas de seguridad a contactos vía WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Número de teléfono</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 600 000 000"
                  className="flex-1"
                  data-testid="whatsapp-phone-input"
                />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Formato internacional con código de país
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Mensaje</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje de alerta..."
                className="mt-1 min-h-24"
                data-testid="whatsapp-message-input"
              />
            </div>

            <Button
              onClick={sendMessage}
              disabled={sending || !phone || !message}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Mensaje
            </Button>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Nota sobre WhatsApp Business API
              </p>
              <p className="text-amber-700 mt-1">
                Para enviar mensajes en producción, configura las credenciales de WhatsApp Business API en el backend. 
                Sin configuración, los mensajes se añaden a una cola.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Queue Card */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Cola de Mensajes
          </CardTitle>
          <CardDescription>
            Mensajes pendientes de envío
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingQueue ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No hay mensajes en cola</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  className="flex items-start justify-between p-3 rounded-lg border border-zinc-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">{item.phone_number}</div>
                      <p className="text-sm text-zinc-600 line-clamp-2">{item.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(item.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppManager;
