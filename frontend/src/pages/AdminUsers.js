import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user: currentUser } = useAuth();
  const API = process.env.REACT_APP_BACKEND_URL;

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API}/api/admin/users`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  }, [API]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesPlan && matchesRole;
  });

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await fetch(`${API}/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción es irreversible.')) return;
    
    try {
      const response = await fetch(`${API}/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        fetchUsers();
        setShowModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getPlanBadge = (plan) => {
    const colors = {
      free: 'bg-gray-100 text-gray-700',
      basic: 'bg-blue-100 text-blue-700',
      premium: 'bg-purple-100 text-purple-700',
      enterprise: 'bg-amber-100 text-amber-700'
    };
    return colors[plan] || colors.free;
  };

  const getRoleBadge = (role) => {
    const colors = {
      user: 'bg-gray-100 text-gray-600',
      admin: 'bg-blue-100 text-blue-700',
      superadmin: 'bg-red-100 text-red-700'
    };
    return colors[role] || colors.user;
  };

  if (!currentUser || (currentUser.role !== 'superadmin' && currentUser.role !== 'admin')) {
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
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Panel de administración - ManoProtect</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Plan Free</p>
            <p className="text-2xl font-bold text-gray-600">{users.filter(u => u.plan === 'free').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Plan Premium</p>
            <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.plan === 'premium').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500 text-sm">Plan Enterprise</p>
            <p className="text-2xl font-bold text-amber-600">{users.filter(u => u.plan === 'enterprise').length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre, email, ID o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los planes</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos los roles</option>
              <option value="user">Usuario</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-500 mt-2">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Registro</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            {user.picture ? (
                              <img src={user.picture} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                              <span className="text-blue-600 font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{user.name || 'Sin nombre'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.user_id}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadge(user.plan)}`}>
                          {user.plan || 'free'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.is_active !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { setSelectedUser(user); setShowModal(true); }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron usuarios con los filtros seleccionados.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Detail Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Gestionar Usuario</h2>
                  <button onClick={() => { setShowModal(false); setSelectedUser(null); }} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      {selectedUser.picture ? (
                        <img src={selectedUser.picture} alt="" className="w-16 h-16 rounded-full" />
                      ) : (
                        <span className="text-2xl text-blue-600 font-bold">
                          {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{selectedUser.name}</p>
                      <p className="text-gray-500">{selectedUser.email}</p>
                      <p className="text-sm text-gray-400">{selectedUser.phone}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">ID:</span> <code className="bg-gray-200 px-1 rounded">{selectedUser.user_id}</code></div>
                    <div><span className="text-gray-500">Proveedor:</span> {selectedUser.auth_provider || 'email'}</div>
                    <div><span className="text-gray-500">Registro:</span> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('es-ES') : '-'}</div>
                    <div><span className="text-gray-500">Stripe ID:</span> {selectedUser.stripe_customer_id || '-'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  {/* Change Plan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar Plan</label>
                    <select
                      defaultValue={selectedUser.plan}
                      onChange={(e) => handleUpdateUser(selectedUser.user_id, { plan: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  {/* Change Role */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar Rol</label>
                    <select
                      defaultValue={selectedUser.role}
                      onChange={(e) => handleUpdateUser(selectedUser.user_id, { role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  </div>

                  {/* Toggle Active */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Estado de la cuenta</span>
                    <button
                      onClick={() => handleUpdateUser(selectedUser.user_id, { is_active: !selectedUser.is_active })}
                      className={`px-4 py-2 rounded-lg font-medium ${selectedUser.is_active !== false ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                    >
                      {selectedUser.is_active !== false ? 'Desactivar' : 'Activar'}
                    </button>
                  </div>

                  {/* Delete User */}
                  <div className="border-t pt-4 mt-4">
                    <button
                      onClick={() => handleDeleteUser(selectedUser.user_id)}
                      className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar Usuario Permanentemente
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-2">Esta acción es irreversible</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
