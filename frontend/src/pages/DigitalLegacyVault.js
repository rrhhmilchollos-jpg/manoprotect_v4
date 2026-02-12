/**
 * Secure Digital Legacy Vault
 * Bóveda digital segura para documentos importantes que se entregan a familiares designados
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Vault, Lock, Plus, Eye, EyeOff, Trash2, Download, Upload,
  ArrowLeft, Shield, Users, Clock, FileText, Key, AlertTriangle,
  CheckCircle, Edit2, Save, X, Loader2, Copy, Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const DOCUMENT_TYPES = [
  { id: 'password', label: 'Contraseña', icon: Key, color: 'bg-blue-500' },
  { id: 'will', label: 'Testamento', icon: FileText, color: 'bg-purple-500' },
  { id: 'insurance', label: 'Seguro', icon: Shield, color: 'bg-green-500' },
  { id: 'bank', label: 'Cuenta Bancaria', icon: Vault, color: 'bg-amber-500' },
  { id: 'property', label: 'Propiedad', icon: FileText, color: 'bg-indigo-500' },
  { id: 'medical', label: 'Historial Médico', icon: FileText, color: 'bg-red-500' },
  { id: 'crypto', label: 'Criptomonedas', icon: Key, color: 'bg-orange-500' },
  { id: 'other', label: 'Otro', icon: FileText, color: 'bg-zinc-500' }
];

const DigitalLegacyVault = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  // New document form
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'password',
    content: '',
    notes: '',
    beneficiary_ids: []
  });

  useEffect(() => {
    if (isUnlocked) {
      loadDocuments();
      loadBeneficiaries();
    }
  }, [isUnlocked]);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API}/legacy-vault/documents`, {
        headers: { 'X-Master-Password': masterPassword },
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBeneficiaries = async () => {
    try {
      const response = await fetch(`${API}/legacy-vault/beneficiaries`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBeneficiaries(data.beneficiaries || []);
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    }
  };

  const unlockVault = async () => {
    if (!masterPassword || masterPassword.length < 8) {
      toast.error('La contraseña maestra debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await fetch(`${API}/legacy-vault/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ master_password: masterPassword })
      });

      if (response.ok) {
        setIsUnlocked(true);
        toast.success('Bóveda desbloqueada');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Contraseña incorrecta');
      }
    } catch (error) {
      toast.error('Error al desbloquear');
    }
  };

  const addDocument = async () => {
    if (!newDoc.title || !newDoc.content) {
      toast.error('Título y contenido son obligatorios');
      return;
    }

    try {
      const response = await fetch(`${API}/legacy-vault/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Password': masterPassword
        },
        credentials: 'include',
        body: JSON.stringify(newDoc)
      });

      if (response.ok) {
        toast.success('Documento guardado en la bóveda');
        setShowAddModal(false);
        setNewDoc({ title: '', type: 'password', content: '', notes: '', beneficiary_ids: [] });
        loadDocuments();
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const deleteDocument = async (docId) => {
    if (!confirm('¿Eliminar este documento permanentemente?')) return;

    try {
      const response = await fetch(`${API}/legacy-vault/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'X-Master-Password': masterPassword },
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Documento eliminado');
        loadDocuments();
      }
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const getDocTypeConfig = (type) => {
    return DOCUMENT_TYPES.find(t => t.id === type) || DOCUMENT_TYPES[DOCUMENT_TYPES.length - 1];
  };

  // Vault Lock Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-emerald-950/20 to-zinc-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-zinc-800/50 border-zinc-700">
          <CardHeader className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Vault className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Bóveda Digital Segura</CardTitle>
            <CardDescription className="text-zinc-400">
              Guarda documentos importantes para tu legado digital
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Contraseña Maestra</label>
              <div className="relative">
                <Input
                  type={showPassword.master ? 'text' : 'password'}
                  value={masterPassword}
                  onChange={(e) => setMasterPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="bg-zinc-900 border-zinc-700 text-white pr-10"
                  onKeyPress={(e) => e.key === 'Enter' && unlockVault()}
                  data-testid="master-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => ({ ...p, master: !p.master }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword.master ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={unlockVault}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              data-testid="unlock-vault-btn"
            >
              <Lock className="w-4 h-4 mr-2" />
              Desbloquear Bóveda
            </Button>

            <div className="pt-4 border-t border-zinc-700">
              <p className="text-xs text-zinc-500 text-center">
                Si es tu primera vez, esta contraseña será tu contraseña maestra.
                <br />
                <strong className="text-amber-400">¡No la olvides! No se puede recuperar.</strong>
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="w-full text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-emerald-950/20 to-zinc-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Vault className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Bóveda Digital Segura</h1>
                <p className="text-white/80">Tu legado digital protegido</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
              <Lock className="w-3 h-3 mr-1" />
              Cifrado AES-256
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-xs text-zinc-400">Documentos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{beneficiaries.length}</p>
                <p className="text-xs text-zinc-400">Beneficiarios</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Key className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {documents.filter(d => d.type === 'password').length}
                </p>
                <p className="text-xs text-zinc-400">Contraseñas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800/50 border-zinc-700">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs text-zinc-400">Cifrado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700"
            data-testid="add-document-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir Documento
          </Button>
          <Button
            variant="outline"
            className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
            onClick={() => setIsUnlocked(false)}
          >
            <Lock className="w-4 h-4 mr-2" />
            Bloquear Bóveda
          </Button>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="bg-zinc-800/30 border-zinc-700 border-dashed">
            <CardContent className="py-16 text-center">
              <Vault className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Tu bóveda está vacía</h3>
              <p className="text-zinc-400 mb-6">
                Comienza añadiendo documentos importantes para tu legado digital
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Primer Documento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const typeConfig = getDocTypeConfig(doc.type);
              const TypeIcon = typeConfig.icon;

              return (
                <Card
                  key={doc.id}
                  className="bg-zinc-800/50 border-zinc-700 hover:border-emerald-500/50 transition-all cursor-pointer"
                  onClick={() => { setSelectedDoc(doc); setShowViewModal(true); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 ${typeConfig.color} rounded-lg`}>
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <h3 className="text-white font-semibold mb-1 truncate">{doc.title}</h3>
                    <p className="text-zinc-500 text-sm truncate">{doc.notes || 'Sin notas'}</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span className="text-xs text-zinc-500">
                        {new Date(doc.created_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-700/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Seguridad de tu Legado Digital</h3>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Cifrado AES-256 de grado militar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Contraseña maestra solo conocida por ti
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Designa beneficiarios que recibirán acceso
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Protocolo de inactividad configurable
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Document Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              Añadir Documento
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Este documento será cifrado y guardado de forma segura
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Título *</label>
              <Input
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Ej: Cuenta de Gmail"
                className="bg-zinc-800 border-zinc-700"
                data-testid="doc-title-input"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Tipo</label>
              <Select value={newDoc.type} onValueChange={(v) => setNewDoc({ ...newDoc, type: v })}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {DOCUMENT_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <span className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Contenido Secreto *</label>
              <Textarea
                value={newDoc.content}
                onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })}
                placeholder="Contraseña, datos de cuenta, instrucciones..."
                className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                data-testid="doc-content-input"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Notas (opcional)</label>
              <Input
                value={newDoc.notes}
                onChange={(e) => setNewDoc({ ...newDoc, notes: e.target.value })}
                placeholder="Notas adicionales..."
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>
              Cancelar
            </Button>
            <Button onClick={addDocument} className="bg-emerald-600 hover:bg-emerald-700" data-testid="save-doc-btn">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          {selectedDoc && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {(() => {
                    const config = getDocTypeConfig(selectedDoc.type);
                    const Icon = config.icon;
                    return <Icon className="w-5 h-5 text-emerald-400" />;
                  })()}
                  {selectedDoc.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  {getDocTypeConfig(selectedDoc.type).label} • Creado {new Date(selectedDoc.created_at).toLocaleDateString('es-ES')}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Contenido</label>
                  <div className="relative">
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 pr-20">
                      <pre className="text-white text-sm whitespace-pre-wrap font-mono">
                        {showPassword[selectedDoc.id] ? selectedDoc.content : '••••••••••••••••'}
                      </pre>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setShowPassword(p => ({ ...p, [selectedDoc.id]: !p[selectedDoc.id] }))}
                      >
                        {showPassword[selectedDoc.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(selectedDoc.content)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedDoc.notes && (
                  <div>
                    <label className="text-sm text-zinc-400 mb-2 block">Notas</label>
                    <p className="text-zinc-300 text-sm">{selectedDoc.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-4">
                <Button
                  variant="destructive"
                  onClick={() => { deleteDocument(selectedDoc.id); setShowViewModal(false); }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </Button>
                <Button variant="ghost" onClick={() => setShowViewModal(false)}>
                  Cerrar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalLegacyVault;
