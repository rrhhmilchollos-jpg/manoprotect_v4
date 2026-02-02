import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminAudios = () => {
  const [audios, setAudios] = useState([]);
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('all');
  const [playingAudio, setPlayingAudio] = useState(null);
  const { user } = useAuth();
  const API = process.env.REACT_APP_BACKEND_URL;

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/audio/stats`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [API]);

  const fetchUserStats = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/audio/users`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [API]);

  const fetchAudios = useCallback(async () => {
    try {
      const url = selectedUser === 'all' 
        ? `${API}/api/admin/audio/all`
        : `${API}/api/admin/audio/all?user_id=${selectedUser}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAudios(data.audios || []);
      }
    } catch (error) {
      console.error('Error fetching audios:', error);
    }
    setLoading(false);
  }, [API, selectedUser]);

  useEffect(() => {
    fetchStats();
    fetchUserStats();
  }, [fetchStats, fetchUserStats]);

  useEffect(() => {
    fetchAudios();
  }, [fetchAudios]);

  const handleDelete = async (audioId) => {
    if (!window.confirm('¿Estás seguro de eliminar este audio?')) return;
    
    try {
      const response = await fetch(`${API}/api/audio/${audioId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchAudios();
        fetchStats();
        fetchUserStats();
      }
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
  };

  const handleDeleteUserAudios = async (userId) => {
    if (!window.confirm('¿Eliminar TODOS los audios de este usuario? Esta acción es irreversible.')) return;
    
    try {
      const response = await fetch(`${API}/api/admin/audio/user/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchAudios();
        fetchStats();
        fetchUserStats();
      }
    } catch (error) {
      console.error('Error deleting user audios:', error);
    }
  };

  const playAudio = (audioId) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800">Acceso Denegado</h2>
          <p className="text-gray-600 mt-2">No tienes permisos para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Audios SOS</h1>
          <p className="text-gray-600 mt-1">Panel de supervisión - ManoProtect</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Total Audios</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_audios}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Usuarios con Audios</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total_users_with_audios}</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Tamaño Total (DB)</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_size_mb} MB</p>
            </div>
            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-gray-500 text-sm">Tamaño en Disco</p>
              <p className="text-2xl font-bold text-green-600">{stats.disk_size_mb} MB</p>
            </div>
          </div>
        )}

        {/* Users with Audios */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Audios por Usuario</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Usuario</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Audios</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Tamaño</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Último</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userStats.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{u.user_name || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{u.user_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">{u._id}</code>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {u.count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {formatSize(u.total_size || 0)}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-500">
                      {formatDate(u.latest)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedUser(u._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => handleDeleteUserAudios(u._id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar Todo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {userStats.length === 0 && (
              <p className="text-center text-gray-500 py-4">No hay audios registrados</p>
            )}
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Filtrar por usuario:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los usuarios</option>
              {userStats.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.user_name || u.user_email || u._id}
                </option>
              ))}
            </select>
            {selectedUser !== 'all' && (
              <button
                onClick={() => setSelectedUser('all')}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Limpiar filtro
              </button>
            )}
          </div>
        </div>

        {/* Audio List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Lista de Audios {selectedUser !== 'all' && `(${audios.length})`}
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando audios...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {audios.map((audio) => (
                <div key={audio.audio_id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => playAudio(audio.audio_id)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            playingAudio === audio.audio_id 
                              ? 'bg-red-500 text-white' 
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                        >
                          {playingAudio === audio.audio_id ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <p className="font-medium text-gray-800">{audio.original_filename || audio.filename}</p>
                          <p className="text-sm text-gray-500">
                            {audio.created_by_name} ({audio.created_by_email})
                          </p>
                        </div>
                      </div>
                      
                      {playingAudio === audio.audio_id && (
                        <div className="mt-3 ml-13">
                          <audio
                            controls
                            autoPlay
                            className="w-full max-w-md"
                            src={`${API}/api/audio/${audio.audio_id}`}
                            onEnded={() => setPlayingAudio(null)}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatSize(audio.file_size)}</span>
                      <span>{formatDate(audio.created_at)}</span>
                      {audio.sos_id && (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                          SOS
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(audio.audio_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {audios.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No hay audios {selectedUser !== 'all' ? 'para este usuario' : 'registrados'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAudios;
