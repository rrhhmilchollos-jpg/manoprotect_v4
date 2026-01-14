import { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const APIKeyManager = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch(`${API}/api-keys`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch(`${API}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: ['read:threats', 'write:analyze']
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedKey(data);
        loadApiKeys();
        setNewKeyName('');
        toast.success('API Key creada correctamente');
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Error al crear API Key');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setCreating(false);
    }
  };

  const revokeApiKey = async (keyId) => {
    if (!confirm('¿Estás seguro de revocar esta API Key? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`${API}/api-keys/${keyId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('API Key revocada');
        loadApiKeys();
      } else {
        toast.error('Error al revocar API Key');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setCreatedKey(null);
    setNewKeyName('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <Card className="bg-white" data-testid="api-key-manager">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              API Keys
            </CardTitle>
            <CardDescription>
              Gestiona tus claves de API para integrar MANO con tus sistemas
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={apiKeys.length >= 5}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva API Key
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tienes API Keys configuradas</p>
            <p className="text-sm mt-1">Crea una para integrar MANO con tus aplicaciones</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div 
                key={key.id}
                className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 hover:border-indigo-200 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Key className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold">{key.name}</div>
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <span>ID: {key.id}</span>
                      <span>•</span>
                      <span>{new Date(key.created_at).toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {key.permissions?.map((perm) => (
                      <Badge key={perm} variant="outline" className="text-xs">
                        {perm.replace(':', ' ')}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeApiKey(key.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {apiKeys.length >= 5 && (
          <p className="text-sm text-amber-600 mt-4 text-center">
            Has alcanzado el límite de 5 API Keys. Revoca una existente para crear más.
          </p>
        )}
      </CardContent>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={closeDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{createdKey ? 'API Key Creada' : 'Nueva API Key'}</DialogTitle>
            <DialogDescription>
              {createdKey 
                ? 'Guarda esta clave de forma segura. No se mostrará de nuevo.'
                : 'Crea una nueva API Key para integrar MANO con tus sistemas'
              }
            </DialogDescription>
          </DialogHeader>

          {createdKey ? (
            <div className="py-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2 text-emerald-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">API Key generada</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white p-3 rounded border text-sm font-mono break-all">
                    {createdKey.key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdKey.key, 'new-key')}
                  >
                    {copiedId === 'new-key' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-zinc-600">
                <p className="font-medium mb-1">Nombre: {createdKey.name}</p>
                <p>Permisos: {createdKey.permissions?.join(', ')}</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre de la API Key</label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Ej: Integración CRM, App Móvil, etc."
                    className="mt-1"
                    data-testid="api-key-name-input"
                  />
                </div>
                <div className="bg-zinc-50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Permisos incluidos:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">read:threats</Badge>
                    <Badge variant="outline">write:analyze</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {createdKey ? (
              <Button onClick={closeDialog} className="bg-indigo-600 hover:bg-indigo-700">
                Entendido
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button 
                  onClick={createApiKey} 
                  disabled={creating}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Crear API Key
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default APIKeyManager;
