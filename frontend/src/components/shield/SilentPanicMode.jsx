/**
 * ManoProtect Shield - Silent Panic Mode
 * Emergency alert system that works silently
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  AlertTriangle, Phone, Mic, MapPin, Users, Settings, 
  Shield, Volume2, VolumeX, Vibrate, Smartphone, Hand,
  CheckCircle, Radio, Eye
} from 'lucide-react';

const TRIGGER_TYPES = [
  { 
    id: 'button_press', 
    icon: Smartphone, 
    label: 'Botón de Encendido', 
    description: 'Pulsa 5 veces rápido el botón de encendido',
    enabled: true
  },
  { 
    id: 'voice_keyword', 
    icon: Mic, 
    label: 'Palabra Clave', 
    description: 'Di la palabra secreta en voz alta',
    enabled: true,
    customizable: true
  },
  { 
    id: 'shake', 
    icon: Vibrate, 
    label: 'Agitar Teléfono', 
    description: 'Agita el teléfono 3 veces seguidas',
    enabled: false
  },
  { 
    id: 'gesture', 
    icon: Hand, 
    label: 'Gesto en Pantalla', 
    description: 'Dibuja un patrón secreto en la pantalla',
    enabled: false
  }
];

const SilentPanicMode = () => {
  const [config, setConfig] = useState({
    enabled: true,
    triggers: ['button_press', 'voice_keyword'],
    keyword: 'Mamá llama a la abuela Rosa',
    emergency_contacts: [
      { name: 'María (Esposa)', phone: '+34600111222' },
      { name: 'Juan (Hermano)', phone: '+34600333444' }
    ],
    auto_record: true,
    send_location: true,
    call_emergency: false,
    silent_mode: true
  });
  
  const [showConfig, setShowConfig] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '' });

  const toggleTrigger = (triggerId) => {
    const newTriggers = config.triggers.includes(triggerId)
      ? config.triggers.filter(t => t !== triggerId)
      : [...config.triggers, triggerId];
    setConfig({ ...config, triggers: newTriggers });
  };

  const addContact = () => {
    if (newContact.name && newContact.phone) {
      setConfig({
        ...config,
        emergency_contacts: [...config.emergency_contacts, newContact]
      });
      setNewContact({ name: '', phone: '' });
    }
  };

  const removeContact = (index) => {
    setConfig({
      ...config,
      emergency_contacts: config.emergency_contacts.filter((_, i) => i !== index)
    });
  };

  const simulateAlert = () => {
    setTestMode(true);
    setTimeout(() => setTestMode(false), 5000);
  };

  return (
    <Card className="border-red-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Modo Pánico Silencioso
                {config.enabled && (
                  <Badge className="bg-emerald-500">Activo</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Alerta de emergencia sin que el agresor lo sepa
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">Activado</span>
              <Switch
                checked={config.enabled}
                onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Test Mode Alert */}
        {testMode && (
          <div className="p-4 bg-red-100 border-2 border-red-500 rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <Radio className="w-6 h-6 text-red-600 animate-spin" />
              <div>
                <p className="font-bold text-red-700">MODO PRUEBA ACTIVO</p>
                <p className="text-sm text-red-600">
                  En una emergencia real, se enviaría tu ubicación y se grabaría audio
                </p>
              </div>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="bg-zinc-50 rounded-lg p-4">
          <h4 className="font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            ¿Cómo funciona?
          </h4>
          <ol className="text-sm text-zinc-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Activa el modo pánico con tu trigger secreto</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>El teléfono NO emite ningún sonido ni vibración</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>Se envía tu ubicación a tus contactos de emergencia</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
              <span>Se graba audio ambiente (si lo tienes activado)</span>
            </li>
          </ol>
        </div>

        {/* Triggers */}
        <div>
          <h4 className="font-semibold text-zinc-700 mb-3">Formas de activar el pánico</h4>
          <div className="space-y-2">
            {TRIGGER_TYPES.map(trigger => (
              <div 
                key={trigger.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  config.triggers.includes(trigger.id) 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    config.triggers.includes(trigger.id) ? 'bg-red-100' : 'bg-zinc-100'
                  }`}>
                    <trigger.icon className={`w-5 h-5 ${
                      config.triggers.includes(trigger.id) ? 'text-red-600' : 'text-zinc-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800">{trigger.label}</p>
                    <p className="text-sm text-zinc-500">{trigger.description}</p>
                  </div>
                </div>
                <Switch
                  checked={config.triggers.includes(trigger.id)}
                  onCheckedChange={() => toggleTrigger(trigger.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Voice Keyword */}
        {config.triggers.includes('voice_keyword') && (
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-2 block">
              Palabra clave secreta
            </label>
            <Input
              value={config.keyword}
              onChange={(e) => setConfig({ ...config, keyword: e.target.value })}
              placeholder="Ej: Mamá llama a la abuela Rosa"
              className="font-medium"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Elige una frase que puedas decir naturalmente sin levantar sospechas
            </p>
          </div>
        )}

        {/* Emergency Contacts */}
        <div>
          <h4 className="font-semibold text-zinc-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contactos de Emergencia
          </h4>
          <div className="space-y-2 mb-3">
            {config.emergency_contacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                    {contact.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-800">{contact.name}</p>
                    <p className="text-sm text-zinc-500">{contact.phone}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeContact(idx)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Nombre"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="flex-1"
            />
            <Input
              placeholder="+34 600..."
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="flex-1"
            />
            <Button onClick={addContact} className="bg-red-600 hover:bg-red-700">
              Añadir
            </Button>
          </div>
        </div>

        {/* Options */}
        <div>
          <h4 className="font-semibold text-zinc-700 mb-3">Acciones automáticas</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-zinc-800">Enviar ubicación</p>
                  <p className="text-sm text-zinc-500">GPS en tiempo real a tus contactos</p>
                </div>
              </div>
              <Switch
                checked={config.send_location}
                onCheckedChange={(checked) => setConfig({ ...config, send_location: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-zinc-800">Grabar audio ambiente</p>
                  <p className="text-sm text-zinc-500">Evidencia de lo que ocurre</p>
                </div>
              </div>
              <Switch
                checked={config.auto_record}
                onCheckedChange={(checked) => setConfig({ ...config, auto_record: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-medium text-zinc-800">Llamar al 112</p>
                  <p className="text-sm text-zinc-500">Contactar emergencias automáticamente</p>
                </div>
              </div>
              <Switch
                checked={config.call_emergency}
                onCheckedChange={(checked) => setConfig({ ...config, call_emergency: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
              <div className="flex items-center gap-3">
                <VolumeX className="w-5 h-5 text-zinc-500" />
                <div>
                  <p className="font-medium text-zinc-800">Modo silencioso</p>
                  <p className="text-sm text-zinc-500">Sin sonido ni vibración al activar</p>
                </div>
              </div>
              <Switch
                checked={config.silent_mode}
                onCheckedChange={(checked) => setConfig({ ...config, silent_mode: checked })}
              />
            </div>
          </div>
        </div>

        {/* Test Button */}
        <Button 
          onClick={simulateAlert}
          variant="outline"
          className="w-full border-red-300 text-red-600 hover:bg-red-50"
          disabled={testMode}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Probar Modo Pánico (No envía alertas reales)
        </Button>

        {/* Info */}
        <div className="text-xs text-zinc-500 text-center space-y-1 pt-2">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" />
            Diseñado para situaciones de violencia, secuestro o robo
          </p>
          <p>El agresor no sabrá que has activado la alerta</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SilentPanicMode;
