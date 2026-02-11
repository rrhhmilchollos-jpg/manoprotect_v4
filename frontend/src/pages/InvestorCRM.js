import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Users, FileText, Download, TrendingUp, Clock, Mail,
  ArrowLeft, Tag, MessageSquare, Filter, Search, Plus,
  ChevronRight, BarChart3, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + '/api';

const STATUS_CONFIG = {
  lead: { color: 'bg-gray-500', label: 'Lead' },
  contacted: { color: 'bg-blue-500', label: 'Contactado' },
  interested: { color: 'bg-yellow-500', label: 'Interesado' },
  negotiating: { color: 'bg-purple-500', label: 'Negociando' },
  committed: { color: 'bg-green-500', label: 'Comprometido' },
  declined: { color: 'bg-red-500', label: 'Declinado' }
};

const DOC_NAMES = {
  'business-plan': 'Plan de Negocio',
  'financial-model': 'Modelo Financiero',
  'pitch-deck': 'Pitch Deck',
  'dossier-b2b': 'Dossier B2B'
};

const InvestorCRM = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [investors, setInvestors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, invRes, analRes] = await Promise.all([
        fetch(`${API}/investor-crm/dashboard`, { credentials: 'include' }),
        fetch(`${API}/investor-crm/investors`, { credentials: 'include' }),
        fetch(`${API}/investor-crm/analytics?days=30`, { credentials: 'include' })
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setDashboard(data);
      }
      if (invRes.ok) {
        const data = await invRes.json();
        setInvestors(data.investors || []);
      }
      if (analRes.ok) {
        const data = await analRes.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos del CRM');
    } finally {
      setLoading(false);
    }
  };

  const loadInvestorDetail = async (investorId) => {
    try {
      const response = await fetch(`${API}/investor-crm/investors/${investorId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedInvestor(data);
      }
    } catch (error) {
      toast.error('Error al cargar detalles');
    }
  };

  const updateStatus = async (investorId, newStatus) => {
    try {
      const response = await fetch(`${API}/investor-crm/investors/${investorId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ investor_id: investorId, status: newStatus })
      });
      if (response.ok) {
        toast.success('Estado actualizado');
        loadData();
        if (selectedInvestor) {
          loadInvestorDetail(investorId);
        }
      }
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const addNote = async (investorId) => {
    if (!newNote.trim()) return;
    try {
      const response = await fetch(`${API}/investor-crm/investors/${investorId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ investor_id: investorId, note: newNote, note_type: 'general' })
      });
      if (response.ok) {
        toast.success('Nota agregada');
        setNewNote('');
        loadInvestorDetail(investorId);
      }
    } catch (error) {
      toast.error('Error al agregar nota');
    }
  };

  const addTag = async (investorId) => {
    if (!newTag.trim()) return;
    try {
      const response = await fetch(`${API}/investor-crm/investors/${investorId}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ investor_id: investorId, tag: newTag })
      });
      if (response.ok) {
        toast.success('Tag agregado');
        setNewTag('');
        loadInvestorDetail(investorId);
        loadData();
      }
    } catch (error) {
      toast.error('Error al agregar tag');
    }
  };

  const removeTag = async (investorId, tag) => {
    try {
      const response = await fetch(`${API}/investor-crm/investors/${investorId}/tags/${tag}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Tag eliminado');
        loadInvestorDetail(investorId);
        loadData();
      }
    } catch (error) {
      toast.error('Error al eliminar tag');
    }
  };

  // Filter investors
  const filteredInvestors = investors.filter(inv => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inv.email?.toLowerCase().includes(q) || inv.name?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-white">Cargando CRM...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-zinc-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-emerald-400" />
                  CRM de Inversores
                </h1>
                <p className="text-zinc-400 text-sm">Gestiona y da seguimiento a inversores potenciales</p>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500 text-emerald-400">
              {investors.length} Inversores
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Total Inversores</p>
                  <p className="text-2xl font-bold text-white">{dashboard.total_investors}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Download className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Descargas Totales</p>
                  <p className="text-2xl font-bold text-white">{dashboard.total_downloads}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Descargas Hoy</p>
                  <p className="text-2xl font-bold text-white">{dashboard.downloads_today}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-zinc-400 text-sm">Comprometidos</p>
                  <p className="text-2xl font-bold text-white">
                    {dashboard.investor_statuses?.committed || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-800 border border-zinc-700">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-emerald-600">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="investors" className="data-[state=active]:bg-emerald-600">
              <Users className="h-4 w-4 mr-2" />
              Inversores
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-emerald-600">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analiticas
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Downloads by Document */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Descargas por Documento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboard?.downloads_by_document && Object.entries(dashboard.downloads_by_document).map(([doc, count]) => (
                    <div key={doc} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-emerald-400" />
                        <span className="text-white">{DOC_NAMES[doc] || doc}</span>
                      </div>
                      <Badge>{count} descargas</Badge>
                    </div>
                  ))}
                  {(!dashboard?.downloads_by_document || Object.keys(dashboard.downloads_by_document).length === 0) && (
                    <p className="text-zinc-500 text-center py-4">Sin descargas todavia</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                  {dashboard?.recent_activity?.map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg">
                      <div>
                        <p className="text-white text-sm">{DOC_NAMES[activity.doc_type] || activity.doc_type}</p>
                        <p className="text-zinc-500 text-xs">{activity.user_id?.slice(0, 20)}...</p>
                      </div>
                      <span className="text-zinc-400 text-xs">
                        {new Date(activity.downloaded_at).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  ))}
                  {(!dashboard?.recent_activity || dashboard.recent_activity.length === 0) && (
                    <p className="text-zinc-500 text-center py-4">Sin actividad reciente</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Funnel */}
            {analytics?.conversion_funnel && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">Embudo de Conversion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    {Object.entries(analytics.conversion_funnel).map(([stage, count], idx) => (
                      <div key={stage} className="flex-1 text-center">
                        <div className={`w-full h-16 ${STATUS_CONFIG[stage]?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center mb-2`}>
                          <span className="text-2xl font-bold text-white">{count}</span>
                        </div>
                        <p className="text-zinc-400 text-sm">{STATUS_CONFIG[stage]?.label || stage}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Investors Tab */}
          <TabsContent value="investors" className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input
                    placeholder="Buscar por email o nombre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white"
              >
                <option value="">Todos los estados</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Investors List */}
              <div className="lg:col-span-2 space-y-3">
                {filteredInvestors.length === 0 ? (
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="py-12 text-center">
                      <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
                      <p className="text-zinc-400">No hay inversores todavia</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredInvestors.map((investor) => (
                    <Card 
                      key={investor.investor_id}
                      className={`bg-zinc-800/50 border-zinc-700 cursor-pointer hover:border-emerald-500/50 transition-colors ${
                        selectedInvestor?.investor_id === investor.investor_id ? 'border-emerald-500' : ''
                      }`}
                      onClick={() => loadInvestorDetail(investor.investor_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${STATUS_CONFIG[investor.status]?.color || 'bg-gray-500'}`} />
                            <div>
                              <p className="text-white font-medium">{investor.name || 'Sin nombre'}</p>
                              <p className="text-zinc-500 text-sm">{investor.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              {investor.total_downloads} descargas
                            </Badge>
                            <p className="text-zinc-500 text-xs">
                              {investor.last_download ? new Date(investor.last_download).toLocaleDateString('es-ES') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        {investor.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {investor.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Investor Detail */}
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader>
                  <CardTitle className="text-white">
                    {selectedInvestor ? 'Detalle del Inversor' : 'Selecciona un inversor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedInvestor ? (
                    <p className="text-zinc-500 text-center py-8">
                      Haz clic en un inversor para ver detalles
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <label className="text-zinc-400 text-sm block mb-2">Estado</label>
                        <select
                          value={selectedInvestor.status}
                          onChange={(e) => updateStatus(selectedInvestor.investor_id, e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Engagement Score */}
                      <div>
                        <label className="text-zinc-400 text-sm">Engagement Score</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${selectedInvestor.engagement_score}%` }}
                            />
                          </div>
                          <span className="text-white">{selectedInvestor.engagement_score}%</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="text-zinc-400 text-sm block mb-2">Tags</label>
                        <div className="flex gap-1 flex-wrap mb-2">
                          {selectedInvestor.tags?.map((tag) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="cursor-pointer hover:bg-red-600"
                              onClick={() => removeTag(selectedInvestor.investor_id, tag)}
                            >
                              {tag} ×
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Nuevo tag"
                            className="bg-zinc-900 border-zinc-700 text-white text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addTag(selectedInvestor.investor_id)}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => addTag(selectedInvestor.investor_id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="text-zinc-400 text-sm block mb-2">Notas</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto mb-2">
                          {selectedInvestor.notes?.map((note, idx) => (
                            <div key={idx} className="p-2 bg-zinc-900/50 rounded text-sm">
                              <p className="text-white">{note.note}</p>
                              <p className="text-zinc-500 text-xs mt-1">
                                {note.created_by_name} - {new Date(note.created_at).toLocaleDateString('es-ES')}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Agregar nota..."
                            className="bg-zinc-900 border-zinc-700 text-white text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addNote(selectedInvestor.investor_id)}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => addNote(selectedInvestor.investor_id)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Documentos Mas Populares (30 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.popular_documents?.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-white">{DOC_NAMES[doc.doc_type] || doc.doc_type}</p>
                        <div className="w-full h-2 bg-zinc-700 rounded-full mt-1">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (doc.downloads / (analytics.popular_documents[0]?.downloads || 1)) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <Badge>{doc.downloads}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvestorCRM;
