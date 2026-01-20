import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Shield, User, Moon, Sun, Bell, Lock, Save, ArrowLeft, Key, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import PushNotificationToggle from '@/components/PushNotificationToggle';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    dark_mode: false,
    notifications_enabled: true,
    auto_block: false
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(`${API}/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setSettings({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          dark_mode: data.dark_mode || false,
          notifications_enabled: data.notifications_enabled !== false,
          auto_block: data.auto_block || false
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Error al cargar el perfil');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
          dark_mode: settings.dark_mode,
          notifications_enabled: settings.notifications_enabled,
          auto_block: settings.auto_block
        })
      });
      
      if (response.ok) {
        toast.success('Configuración guardada correctamente');
        loadProfile();
      } else {
        toast.error('Error al guardar configuración');
      }
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
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
              <img src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" alt="ManoProtect Logo" className="h-7 w-auto" />
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
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    data-testid="phone-input"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    placeholder="+34 600 000 000"
                    className="mt-1 h-12 bg-zinc-50 border-zinc-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card className="bg-white border-zinc-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Notificaciones Push
                </CardTitle>
                <CardDescription>
                  Recibe alertas instantáneas en tu navegador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PushNotificationToggle />
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
                      <div className="font-semibold">Alertas por Email</div>
                      <div className="text-sm text-zinc-600">Recibir resumen de amenazas por correo</div>
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

            {/* Stats */}
            {user.stats && (
              <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5" />
                    Tu Protección
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{user.stats.total_analyzed}</div>
                      <div className="text-sm text-indigo-200">Analizados</div>
                    </div>
                    <div className="text-center bg-white/10 rounded-lg p-4">
                      <div className="text-3xl font-bold">{user.stats.threats_blocked}</div>
                      <div className="text-sm text-indigo-200">Bloqueados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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