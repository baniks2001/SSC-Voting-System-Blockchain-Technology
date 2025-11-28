import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Eye, Search, Mail, Lock, User, MoreVertical, Shield } from 'lucide-react';
import { Admin } from '../../types';
import { api } from '../../utils/api';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal } from '../common/Modal';
import { useToast } from '../common/Toast';

export const AdminManagement: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [viewingAdmin, setViewingAdmin] = useState<Admin | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileActions, setShowMobileActions] = useState<number | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as 'admin' | 'auditor' | 'poll_monitor'
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/admins');
      setAdmins(response);
    } catch (error: any) {
      showToast('error', 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAdmin) {
        await api.put(`/admin/admins/${editingAdmin.id}`, formData);
        showToast('success', 'Admin updated successfully');
      } else {
        await api.post('/admin/admins', formData);
        showToast('success', 'Admin created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      showToast('error', error.message || 'Operation failed');
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: '',
      fullName: admin.full_name,
      role: admin.role
    });
    setShowModal(true);
    setShowMobileActions(null);
  };

  const handleView = (admin: Admin) => {
    setViewingAdmin(admin);
    setShowViewModal(true);
    setShowMobileActions(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await api.delete(`/admin/admins/${id}`);
      showToast('success', 'Admin deleted successfully');
      fetchAdmins();
      setShowMobileActions(null);
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete admin');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'admin'
    });
    setEditingAdmin(null);
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'auditor': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'poll_monitor': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full Access and with limitation';
      case 'auditor': return 'View Only and Export Recent Logs';
      case 'poll_monitor': return 'View Only';
      default: return role;
    }
  };

  const canControlPoll = (admin: Admin) => {
    return admin.role === 'admin'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading admins..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 animate-fadeIn p-3 sm:p-4 lg:p-6">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-gray-500 text-sm sm:text-base mt-1">
                  Manage system administrators and their roles
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Admin</span>
            <span className="sm:hidden">Add Admin</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search admins by email, name, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base placeholder-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            System Administrators
            <span className="text-gray-500 font-normal ml-2">({filteredAdmins.length})</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          {/* Desktop Table */}
          <table className="hidden lg:table w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Poll Access</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <User className="w-12 h-12 text-gray-300" />
                      <div>
                        <p className="text-gray-500 font-medium">No admins found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first admin"}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50/80 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.full_name}</p>
                          <p className="text-sm text-gray-600">{admin.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        canControlPoll(admin) 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {canControlPoll(admin) ? 'Can Control Poll' : 'View Only'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(admin.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(admin)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                          title="Edit Admin"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3 p-4">
            {filteredAdmins.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No admins found</p>
              </div>
            ) : (
              filteredAdmins.map((admin) => (
                <div key={admin.id} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{admin.full_name}</p>
                        <p className="text-sm text-gray-600 truncate">{admin.email}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowMobileActions(showMobileActions === admin.id ? null : admin.id)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showMobileActions === admin.id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg z-10 w-40 overflow-hidden">
                          <button
                            onClick={() => handleView(admin)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleEdit(admin)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {admin.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        canControlPoll(admin) 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {canControlPoll(admin) ? 'Can Control Poll' : 'View Only'}
                      </span>
                      <div className="text-xs text-gray-600 text-right">
                        {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Role Description for Mobile */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Shield className="w-3 h-3 text-gray-400" />
                      <span className="font-medium text-gray-700">Role Description</span>
                    </div>
                    {getRoleDescription(admin.role)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table Footer */}
        {filteredAdmins.length > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredAdmins.length}</span> admin{filteredAdmins.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingAdmin ? 'Edit Admin' : 'Add New Admin'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="admin">Admin (Full Access with Limitation)</option>
              <option value="auditor">Auditor (Dashboard View/Export Logs)</option>
              <option value="poll_monitor">Poll Monitor (Viewing Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password {editingAdmin && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required={!editingAdmin}
              minLength={6}
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
              {editingAdmin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Admin Details"
        size="md"
      >
        {viewingAdmin && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{viewingAdmin.full_name}</h3>
              <p className="text-gray-600 text-sm sm:text-base mt-1">{viewingAdmin.email}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Role</label>
                <p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(viewingAdmin.role)}`}>
                    {viewingAdmin.role.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  {getRoleDescription(viewingAdmin.role)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Status</label>
                <p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    viewingAdmin.is_active 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    {viewingAdmin.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Poll Access</label>
                <p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    canControlPoll(viewingAdmin) 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {canControlPoll(viewingAdmin) ? 'Can Control Poll' : 'View Only'}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Created</label>
                <p className="text-sm text-gray-900 font-medium">
                  {new Date(viewingAdmin.created_at).toLocaleString()}
                </p>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Admin ID</label>
                <p className="text-sm text-gray-900 font-mono">#{viewingAdmin.id}</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-xl transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};