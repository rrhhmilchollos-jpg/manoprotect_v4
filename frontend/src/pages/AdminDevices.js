import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTarget, setBlockTarget] = useState({ type: 'ip', value: '', reason: '', duration: '' });
  const [ipSearch, setIpSearch] = useState('');
  const [ipHistory, setIpHistory] = useState(null);
  const { user } = useAuth();
  const API = process.env.REACT_APP_BACKEND_URL;

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/device/stats`, { credentials: 'include' });
      if (response.ok) setStats(await response.json());
    } catch (error) {
      console.error('Error:', error);
    }
  }, [API]);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/device/all`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  }, [API]);

  const fetchBlocked = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/device/blocked`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setBlocked(data.blocked || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [API]);

  useEffect(() => {
    fetchStats();
    fetchDevices();
    fetchBlocked();
  }, [fetchStats, fetchDevices, fetchBlocked]);

  const handleBlock = async () => {
    if (!blockTarget.value || !blockTarget.reason) {
      alert('Completa todos los campos');
      return;
    }

    try {
      const body = {
        reason: blockTarget.reason,
        duration_hours: blockTarget.duration ? parseInt(blockTarget.duration) : null
      };
      
      if (blockTarget.type === 'ip') {
        body.ip_address = blockTarget.value;
      } else {
        body.device_id = blockTarget.value;
      }

      const response = await fetch(`${API}/api/admin/device/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setShowBlockModal(false);
        setBlockTarget({ type: 'ip', value: '', reason: '', duration: '' });
        fetchBlocked();
        fetchStats();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnblock = async (blockId) => {
    if (!window.confirm('¿Desbloquear este dispositivo/IP?')) return;

    try {
      const response = await fetch(`${API}/api/admin/device/unblock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ block_id: blockId })
      });

      if (response.ok) {
        fetchBlocked();
        fetchStats();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const searchIpHistory = async () => {
    if (!ipSearch) return;

    try {
      const response = await fetch(`${API}/api/admin/device/ip-history/${ipSearch}`, {
        credentials: 'include'
      });
      if (response.ok) {
        setIpHistory(await response.json());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-ES');
  };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800">Acceso Denegado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Dispositivos</h1>
            <p className="text-gray-600 mt-1">Control de IPs y dispositivos - ManoProtect</p>
          </div>
          <button
            onClick={() => setShowBlockModal(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Bloquear IP/Dispositivo
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Dispositivos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_devices}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">IPs Únicas</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unique_ips}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Activos (24h)</p>
              <p className="text-2xl font-bold text-green-600">{stats.recent_activity_24h}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Total Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{stats.active_blocks}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">IPs Bloqueadas</p>
              <p className="text-2xl font-bold text-orange-600">{stats.blocked_ips}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Dispositivos Bloq.</p>
              <p className="text-2xl font-bold text-purple-600">{stats.blocked_devices}</p>
            </div>
          </div>
        )}

        {/* IP Search */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Buscar Historial de IP</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={ipSearch}
              onChange={(e) => setIpSearch(e.target.value)}
              placeholder="Introduce una IP (ej: 192.168.1.1)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={searchIpHistory}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>

          {ipHistory && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">IP: {ipHistory.ip_address}</h3>
                {ipHistory.is_blocked ? (
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">BLOQUEADA</span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Activa</span>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Usuarios ({ipHistory.users?.length || 0})</p>
                  <ul className="space-y-1">
                    {ipHistory.users?.slice(0, 5).map(u => (
                      <li key={u.user_id} className="text-sm">{u.name} - {u.email}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Dispositivos ({ipHistory.devices?.length || 0})</p>
                  <p className="text-sm">Intentos de login: {ipHistory.login_attempts?.length || 0}</p>
                </div>
              </div>
              {!ipHistory.is_blocked && (
                <button
                  onClick={() => {
                    setBlockTarget({ type: 'ip', value: ipHistory.ip_address, reason: '', duration: '' });
                    setShowBlockModal(true);
                  }}
                  className="mt-4 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Bloquear esta IP
                </button>
              )}
            </div>
          )}
        </div>

        {/* Blocked List */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dispositivos/IPs Bloqueados ({blocked.length})</h2>
          {blocked.length > 0 ? (
            <div className="space-y-3">
              {blocked.map((b) => (
                <div key={b.block_id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${b.block_type === 'ip' ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                        {b.block_type === 'ip' ? 'IP' : 'DISPOSITIVO'}
                      </span>
                      <code className="font-mono text-sm">{b.ip_address || b.device_id}</code>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Razón: {b.reason}</p>
                    <p className="text-xs text-gray-400">
                      Por: {b.blocked_by_email} | {formatDate(b.blocked_at)}
                      {b.expires_at && ` | Expira: ${formatDate(b.expires_at)}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblock(b.block_id)}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm"
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay dispositivos bloqueados</p>
          )}
        </div>

        {/* Recent Devices */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Dispositivos Recientes</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">IP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Device ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Navegador</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Última vez</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {devices.slice(0, 50).map((d, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{d.user_id}</code>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{d.ip_address}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs">{d.device_id}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {d.user_agent?.substring(0, 50)}...
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(d.last_seen)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setBlockTarget({ type: 'ip', value: d.ip_address, reason: '', duration: '' });
                            setShowBlockModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Bloquear IP
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Block Modal */}
        {showBlockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Bloquear IP/Dispositivo</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={blockTarget.type}
                    onChange={(e) => setBlockTarget({...blockTarget, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="ip">Dirección IP</option>
                    <option value="device">ID de Dispositivo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {blockTarget.type === 'ip' ? 'Dirección IP' : 'Device ID'}
                  </label>
                  <input
                    type="text"
                    value={blockTarget.value}
                    onChange={(e) => setBlockTarget({...blockTarget, value: e.target.value})}
                    placeholder={blockTarget.type === 'ip' ? '192.168.1.1' : 'dev_abc123'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razón del bloqueo *</label>
                  <textarea
                    value={blockTarget.reason}
                    onChange={(e) => setBlockTarget({...blockTarget, reason: e.target.value})}
                    placeholder="Describe la razón del bloqueo..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración (horas)</label>
                  <input
                    type="number"
                    value={blockTarget.duration}
                    onChange={(e) => setBlockTarget({...blockTarget, duration: e.target.value})}
                    placeholder="Dejar vacío = permanente"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">Deja vacío para bloqueo permanente</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBlock}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDevices;
