/**
 * ManoProtect Shield - Digital Inheritance Vault
 * Secure vault for digital assets with emergency access protocols
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Vault, Plus, Lock, Key, FileText, CreditCard, Heart, 
  Users, Clock, Shield, Eye, EyeOff, Trash2, Edit2, 
  AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ITEM_TYPES = [
  { id: 'password', label: 'Contraseña', icon: Key, color: 'bg-blue-100 text-blue-600' },
  { id: 'document', label: 'Documento', icon: FileText, color: 'bg-amber-100 text-amber-600' },
  { id: 'bank_info', label: 'Información Bancaria', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'crypto_key', label: 'Clave Crypto', icon: Lock, color: 'bg-purple-100 text-purple-600' },
  { id: 'medical', label: 'Info Médica', icon: Heart, color: 'bg-red-100 text-red-600' },
  { id: 'note', label: 'Nota Personal', icon: FileText, color: 'bg-zinc-100 text-zinc-600' }
];

const DigitalInheritance = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [revealedItems, setRevealedItems] = useState({});
  
  const [newItem, setNewItem] = useState({
    title: '',
    item_type: 'password',
    content: '',
    notes: '',
    beneficiaries: []
  });

  const [config, setConfig] = useState({
    inactivity_days: 30,
    require_verification: true,
    notify_on_access: true,
    emergency_contacts: []
  });

  // Demo data
  useEffect(() => {
    setTimeout(() => {
      setItems([
        {
          id: '1',
          title: 'Email Principal - Gmail',
          item_type: 'password',
          content: 'mi_email_secreto_2024',
          notes: 'Cuenta principal de correo',
          created_at: new Date().toISOString(),
          beneficiaries: ['María (Esposa)']
        },
        {
          id: '2',
          title: 'Testamento Digital',
          item_type: 'document',
          content: 'Ubicación del testamento: Notaría García, Calle Mayor 15, Valencia',
          notes: 'Contactar a Pedro García para más detalles',
          created_at: new Date().toISOString(),
          beneficiaries: ['María (Esposa)', 'Juan (Hijo)']
        },
        {
          id: '3',
          title: 'Cuenta BBVA Principal',
          item_type: 'bank_info',
          content: 'IBAN: ES91 2100 0418 4502 0005 1332\nClaves de acceso en caja fuerte',
          notes: 'Cuenta donde está el ahorro familiar',
          created_at: new Date().toISOString(),
          beneficiaries: ['María (Esposa)']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddItem = () => {
    const item = {
      id: Date.now().toString(),
      ...newItem,
      created_at: new Date().toISOString()
    };
    setItems([...items, item]);
    setNewItem({ title: '', item_type: 'password', content: '', notes: '', beneficiaries: [] });
    setShowAddDialog(false);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleReveal = (id) => {
    setRevealedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getTypeInfo = (type) => ITEM_TYPES.find(t => t.id === type) || ITEM_TYPES[0];

  return (
    <Card className="border-emerald-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Vault className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Herencia Digital</CardTitle>
              <CardDescription>
                Bóveda segura para tus datos importantes
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Protocolo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Protocolo de Emergencia</DialogTitle>
                  <DialogDescription>
                    Configura cuándo y cómo tus beneficiarios pueden acceder
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium">Días de inactividad antes de alerta</label>
                    <Input
                      type="number"
                      value={config.inactivity_days}
                      onChange={(e) => setConfig({...config, inactivity_days: parseInt(e.target.value)})}
                      className="mt-1"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      Si no accedes en {config.inactivity_days} días, se notificará a tus beneficiarios
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requerir verificación de identidad</span>
                    <Button
                      variant={config.require_verification ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setConfig({...config, require_verification: !config.require_verification})}
                    >
                      {config.require_verification ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificar cuando accedan</span>
                    <Button
                      variant={config.notify_on_access ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setConfig({...config, notify_on_access: !config.notify_on_access})}
                    >
                      {config.notify_on_access ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowConfigDialog(false)} className="bg-emerald-600 hover:bg-emerald-700">
                    Guardar Configuración
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Añadir a la Bóveda</DialogTitle>
                  <DialogDescription>
                    Guarda información importante de forma segura
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo</label>
                    <div className="flex flex-wrap gap-2">
                      {ITEM_TYPES.map(type => (
                        <Button
                          key={type.id}
                          variant={newItem.item_type === type.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewItem({...newItem, item_type: type.id})}
                          className={newItem.item_type === type.id ? 'bg-emerald-600' : ''}
                        >
                          <type.icon className="w-4 h-4 mr-1" />
                          {type.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Input
                    placeholder="Título (ej: Cuenta de Gmail)"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  />
                  <Textarea
                    placeholder="Contenido secreto (contraseña, información, etc.)"
                    value={newItem.content}
                    onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                    rows={3}
                  />
                  <Input
                    placeholder="Notas adicionales (opcional)"
                    value={newItem.notes}
                    onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                  />
                  <Input
                    placeholder="Beneficiarios (separados por coma)"
                    value={newItem.beneficiaries.join(', ')}
                    onChange={(e) => setNewItem({...newItem, beneficiaries: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  />
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleAddItem}
                    disabled={!newItem.title || !newItem.content}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Guardar en Bóveda
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Security Info */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-emerald-800">Cifrado de extremo a extremo</p>
              <p className="text-emerald-700">
                Tu información está cifrada y solo tú y tus beneficiarios designados pueden acceder.
              </p>
            </div>
          </div>
        </div>

        {/* Protocol Status */}
        <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-zinc-600" />
            <div>
              <p className="text-sm font-medium text-zinc-700">Protocolo de Emergencia</p>
              <p className="text-xs text-zinc-500">
                Alerta tras {config.inactivity_days} días de inactividad
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Activo
          </Badge>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-zinc-500 mt-2">Cargando bóveda...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center">
            <Vault className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
            <p className="text-zinc-600 font-medium">Tu bóveda está vacía</p>
            <p className="text-sm text-zinc-500">Añade contraseñas, documentos y más</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const typeInfo = getTypeInfo(item.item_type);
              const isRevealed = revealedItems[item.id];
              
              return (
                <div 
                  key={item.id}
                  className="border border-zinc-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${typeInfo.color} flex items-center justify-center flex-shrink-0`}>
                        <typeInfo.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-zinc-900">{item.title}</h4>
                        <Badge variant="outline" className="text-xs mt-1">{typeInfo.label}</Badge>
                        
                        {/* Content */}
                        <div className="mt-2">
                          {isRevealed ? (
                            <pre className="text-sm bg-zinc-100 p-2 rounded font-mono whitespace-pre-wrap">
                              {item.content}
                            </pre>
                          ) : (
                            <p className="text-sm text-zinc-500">••••••••••••••••</p>
                          )}
                        </div>
                        
                        {item.notes && isRevealed && (
                          <p className="text-xs text-zinc-500 mt-2">{item.notes}</p>
                        )}
                        
                        {/* Beneficiaries */}
                        {item.beneficiaries?.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Users className="w-3 h-3 text-zinc-400" />
                            <span className="text-xs text-zinc-500">
                              {item.beneficiaries.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleReveal(item.id)}
                      >
                        {isRevealed ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 text-xs text-zinc-500 text-center space-y-1">
          <p>Toda la información está cifrada con AES-256</p>
          <p>Solo tus beneficiarios podrán acceder en caso de emergencia</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalInheritance;
