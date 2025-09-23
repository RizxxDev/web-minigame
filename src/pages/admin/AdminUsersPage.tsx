import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Trash2, Edit, Search, Filter, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Profile, type GameProgress } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type UserWithProgress = Profile & { 
  game_progress?: GameProgress[];
};

export default function AdminUsersPage() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProgress | null>(null);

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          game_progress (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as UserWithProgress[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User role updated to ${newRole}`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const resetUserProgress = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s progress?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('game_progress')
        .update({
          score: 0,
          clicks: 0,
          click_power: 1,
          auto_clickers: 0,
          auto_click_power: 1,
          coins: 0,
          gems: 10,
          total_spent: 0,
        })
        .eq('user_id', userId);

      if (error) throw error;
      toast.success('User progress reset successfully');
      loadUsers();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold text-white">User Management</h1>
        </div>
        <p className="text-gray-400">
          Manage user accounts, roles, and game progress
        </p>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Players</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.game_progress && u.game_progress.length > 0).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Admins</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Progress</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Joined</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => {
                  const progress = user.game_progress?.[0];
                  return (
                    <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-white">{user.username}</div>
                          <div className="text-sm text-gray-400">{user.email}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {user.role === 'admin' ? (
                            <><Shield className="w-3 h-3 inline mr-1" />Admin</>
                          ) : (
                            'User'
                          )}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {progress ? (
                          <div className="text-sm">
                            <div className="text-white">Score: {progress.score.toLocaleString()}</div>
                            <div className="text-gray-400">Coins: {progress.coins.toLocaleString()}</div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No progress</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'user' : 'admin')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                              user.role === 'admin'
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          
                          {progress && (
                            <button
                              onClick={() => resetUserProgress(user.id)}
                              className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-xs font-semibold transition-colors"
                            >
                              Reset Progress
                            </button>
                          )}
                          
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <UserX className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No users found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}