import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, User, Moon, Sun, Bell, Lock, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    dark_mode: false,
    notifications_enabled: true,
    auto_block: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API}/users/demo-user`);
      setUser(response.data);
      setSettings({
        name: response.data.name,
        email: response.data.email,
        dark_mode: response.data.dark_mode,
        notifications_enabled: response.data.notifications_enabled,
        auto_block: response.data.auto_block
      });
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await axios.patch(`${API}/users/demo-user`, {
        name: settings.name,
        dark_mode: settings.dark_mode,
        notifications_enabled: settings.notifications_enabled,
        auto_block: settings.auto_block
      });
      toast.success('Configuración guardada correctamente');
      loadUser();
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-btn"
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-7 h-7 text-indigo-600" />
              <span className="text-xl font-bold">Perfil y Configuración</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="lg:col-span-1 bg-white border-zinc-200 h-fit">
            <CardContent className="p-8 text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              <p className="text-zinc-600 mb-4">{user.email}</p>
              <Badge className={`${
                user.plan === 'premium' ? 'bg-indigo-600' : 'bg-emerald-500'
              } text-white text-sm px-4 py-1`}>
                Plan {user.plan === 'premium' ? 'Premium' : 'Gratis'}
              </Badge>
              {user.plan === 'free' && (
                <Button
                  data-testid="upgrade-btn"
                  className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-11"
                  onClick={() => toast.info('Funcionalidad próximamente')}
                >
                  Actualizar a Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card className="bg-white border-zinc-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    data-testid="name-input"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                    className="mt-1 h-12 bg-zinc-50 border-zinc-200"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    disabled
                    className="mt-1 h-12 bg-zinc-100 border-zinc-200 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-1">El email no se puede cambiar</p>
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white border-zinc-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Preferencias y Seguridad
                </CardTitle>
                <CardDescription>
                  Configura cómo MANO te protege
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      {settings.dark_mode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-semibold">Modo Oscuro</div>
                      <div className="text-sm text-zinc-600">Tema oscuro para la interfaz</div>
                    </div>
                  </div>
                  <Switch
                    data-testid="dark-mode-switch"
                    checked={settings.dark_mode}
                    onCheckedChange={(checked) => setSettings({...settings, dark_mode: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Notificaciones</div>
                      <div className="text-sm text-zinc-600">Recibir alertas de amenazas</div>
                    </div>
                  </div>
                  <Switch
                    data-testid="notifications-switch"
                    checked={settings.notifications_enabled}
                    onCheckedChange={(checked) => setSettings({...settings, notifications_enabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold">Bloqueo Automático</div>
                      <div className="text-sm text-zinc-600">Bloquear amenazas críticas automáticamente</div>
                    </div>
                  </div>
                  <Switch
                    data-testid="auto-block-switch"
                    checked={settings.auto_block}
                    onCheckedChange={(checked) => setSettings({...settings, auto_block: checked})}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              data-testid="save-settings-btn"
              onClick={saveSettings}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12 shadow-sm active:scale-95 transition-all"
            >
              <Save className="w-5 h-5 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;