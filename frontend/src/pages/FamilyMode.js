import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, AlertOctagon, Phone, Users, Navigation, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FamilyMode = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [sosTriggered, setSosTriggered] = useState(false);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts?user_id=demo-user`);
      const emergencyContacts = response.data.filter(c => c.is_emergency);
      setContacts(emergencyContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const triggerSOS = async () => {
    if (contacts.length === 0) {
      toast.error('No tienes contactos de emergencia configurados');
      navigate('/contacts');
      return;
    }

    try {
      await axios.post(`${API}/sos`, {
        user_id: 'demo-user',
        location: 'Ubicación no disponible',
        message: 'Alerta SOS activada desde MANO'
      });
      
      setSosTriggered(true);
      toast.success(`¡Alerta enviada a ${contacts.length} contactos!`);
      
      setTimeout(() => setSosTriggered(false), 5000);
    } catch (error) {
      toast.error('Error al enviar alerta SOS');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-6 border-b border-emerald-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg text-xl w-14 h-14"
            >
              <ArrowLeft className="w-7 h-7" />
            </Button>
            <div className="flex items-center gap-3">
              <img src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" alt="MANO Logo" className="h-10 w-auto" />
              <span className="text-3xl font-bold">Modo Familiar</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* SOS Button - GRANDE */}
        <Card className={`mb-12 border-4 ${
          sosTriggered ? 'border-rose-500 bg-rose-50' : 'border-rose-300 bg-white'
        } transition-all duration-300`}>
          <CardContent className="p-12 text-center">
            <Button
              data-testid="sos-button"
              onClick={triggerSOS}
              disabled={sosTriggered}
              className={`w-64 h-64 rounded-full text-4xl font-bold shadow-2xl active:scale-95 transition-all ${
                sosTriggered 
                  ? 'bg-zinc-400 cursor-not-allowed' 
                  : 'bg-rose-600 hover:bg-rose-700 animate-pulse'
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <AlertOctagon className="w-24 h-24" />
                <span>{sosTriggered ? 'ENVIADO' : 'SOS'}</span>
              </div>
            </Button>
            <p className="text-2xl text-zinc-700 mt-8 font-semibold">
              {sosTriggered 
                ? '¡Tus contactos han sido notificados!' 
                : 'Presiona si necesitas ayuda urgente'
              }
            </p>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="bg-white border-2 border-emerald-200 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <Phone className="w-7 h-7 text-emerald-600" />
              Contactos de Emergencia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
                <p className="text-xl text-zinc-600 mb-6">No hay contactos de emergencia</p>
                <Button
                  data-testid="add-contacts-btn"
                  onClick={() => navigate('/contacts')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-8 h-14 text-lg"
                >
                  Añadir Contactos
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact, idx) => (
                  <div
                    key={idx}
                    data-testid={`emergency-contact-${idx}`}
                    className="flex items-center gap-4 p-6 rounded-xl bg-emerald-50 border-2 border-emerald-200"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-900">{contact.name}</div>
                      <div className="text-xl text-emerald-700">{contact.phone}</div>
                      <div className="text-lg text-emerald-600 capitalize">{contact.relationship}</div>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => navigate('/contacts')}
                  variant="outline"
                  className="w-full h-14 text-lg border-2 border-emerald-300 hover:bg-emerald-50 rounded-lg"
                >
                  Gestionar Contactos
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 gap-6">
          <Card 
            className="bg-white border-2 border-indigo-200 cursor-pointer hover:border-indigo-400 transition-all card-hover"
            onClick={() => navigate('/dashboard')}
          >
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-2xl font-bold mb-2">Analizar Amenaza</h3>
              <p className="text-lg text-zinc-600">Verificar llamada o mensaje</p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white border-2 border-emerald-200 cursor-pointer hover:border-emerald-400 transition-all card-hover"
            onClick={() => navigate('/knowledge')}
          >
            <CardContent className="p-8 text-center">
              <Navigation className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
              <h3 className="text-2xl font-bold mb-2">Aprender</h3>
              <p className="text-lg text-zinc-600">Consejos de seguridad</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FamilyMode;