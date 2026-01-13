import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Phone, UserPlus, Trash2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: 'familiar',
    is_emergency: false
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await axios.get(`${API}/contacts?user_id=demo-user`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/contacts?user_id=demo-user`, newContact);
      toast.success('Contacto añadido correctamente');
      setNewContact({ name: '', phone: '', relationship: 'familiar', is_emergency: false });
      setDialogOpen(false);
      loadContacts();
    } catch (error) {
      toast.error('Error al añadir contacto');
    } finally {
      setLoading(false);
    }
  };

  const deleteContact = async (contactId) => {
    try {
      await axios.delete(`${API}/contacts/${contactId}`);
      toast.success('Contacto eliminado');
      loadContacts();
    } catch (error) {
      toast.error('Error al eliminar contacto');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-6 py-4 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
              <img src="https://customer-assets.emergentagent.com/job_5c97b24f-9a55-4567-9954-bd76179fb951/artifacts/8y6ab2pd_logo%20App%20Mano.png" alt="MANO Logo" className="h-7 w-auto" />
              <span className="text-xl font-bold">Contactos de Confianza</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Card */}
        <Card className="mb-8 border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <AlertCircle className="w-5 h-5" />
              ¿Qué son los Contactos de Confianza?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-indigo-800">
              Son personas que serán notificadas automáticamente cuando actives el botón SOS en el Modo Familiar. 
              Marca como "emergencia" aquellos que deben recibir alertas críticas.
            </p>
          </CardContent>
        </Card>

        {/* Add Contact Button */}
        <div className="mb-6">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-contact-btn"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 h-12 shadow-sm active:scale-95 transition-all"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Añadir Contacto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Nuevo Contacto de Confianza</DialogTitle>
                <DialogDescription>
                  Añade un familiar, amigo o cuidador que pueda ayudarte en caso de emergencia.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input
                    id="name"
                    data-testid="contact-name-input"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                    placeholder="Ej: María García"
                    className="mt-1 h-12 bg-zinc-50 border-zinc-200"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    data-testid="contact-phone-input"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                    placeholder="+34 666 123 456"
                    className="mt-1 h-12 bg-zinc-50 border-zinc-200"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relación</Label>
                  <Select
                    value={newContact.relationship}
                    onValueChange={(value) => setNewContact({...newContact, relationship: value})}
                  >
                    <SelectTrigger className="mt-1 h-12 bg-zinc-50 border-zinc-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="familiar">Familiar</SelectItem>
                      <SelectItem value="amigo">Amigo/a</SelectItem>
                      <SelectItem value="cuidador">Cuidador/a</SelectItem>
                      <SelectItem value="vecino">Vecino/a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emergency"
                    data-testid="contact-emergency-checkbox"
                    checked={newContact.is_emergency}
                    onChange={(e) => setNewContact({...newContact, is_emergency: e.target.checked})}
                    className="w-4 h-4 rounded border-zinc-300 text-indigo-600"
                  />
                  <Label htmlFor="emergency" className="cursor-pointer">
                    Contacto de emergencia (recibe alertas SOS)
                  </Label>
                </div>
              </div>
              <Button
                data-testid="save-contact-btn"
                onClick={addContact}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12"
              >
                {loading ? 'Guardando...' : 'Guardar Contacto'}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contacts List */}
        <div className="space-y-3">
          {contacts.length === 0 ? (
            <Card className="bg-white border-zinc-200">
              <CardContent className="py-12 text-center">
                <Phone className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
                <p className="text-zinc-500">Aún no has añadido contactos de confianza</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact, idx) => (
              <Card
                key={contact.id || idx}
                data-testid={`contact-item-${idx}`}
                className="bg-white border-zinc-200 hover:border-indigo-200 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Phone className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg flex items-center gap-2">
                          {contact.name}
                          {contact.is_emergency && (
                            <Badge className="bg-rose-500 text-white">Emergencia</Badge>
                          )}
                        </div>
                        <div className="text-sm text-zinc-600">{contact.phone}</div>
                        <div className="text-xs text-zinc-500 capitalize">{contact.relationship}</div>
                      </div>
                    </div>
                    <Button
                      data-testid={`delete-contact-${idx}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteContact(contact.id)}
                      className="text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Contacts;