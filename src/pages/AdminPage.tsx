import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Package, ArrowRightLeft, Settings, Trash2, Edit, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, type Profile, type GameProgress, type Item, type Trade } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'items' | 'trades' | 'settings'>('users');
  const [users, setUsers] = useState<(Profile & { game_progress?: GameProgress })[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    rarity: 'common' as const,
    effect_type: 'click_power' as const,
    effect_value: 1,
    image_url: '🎁',
  });

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'items') loadItems();
    if (activeTab === 'trades') loadTrades();
  }, [activeTab]);

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
      setUsers(data as any);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const loadTrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          sender:sender_id (username),
          receiver:receiver_id (username),
          offered_item:offered_item_id (*),
          requested_item:requested_item_id (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data as Trade[]);
    } catch (error) {
      console.error('Error loading trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

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

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('items')
          .update(itemForm)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast.success('Item updated successfully');
      } else {
        const { error } = await supabase
          .from('items')
          .insert([itemForm]);

        if (error) throw error;
        toast.success('Item created successfully');
      }

      setShowItemModal(false);
      setEditingItem(null);
      setItemForm({
        name: '',
        description: '',
        rarity: 'common',
        effect_type: 'click_power',
        effect_value: 1,
        image_url: '🎁',
      });
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      toast.success('Item deleted successfully');
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  const cancelTrade = async (tradeId: string) => {
    if (!confirm('Are you sure you want to cancel this trade?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('trades')
        .update({ status: 'cancelled' })
        .eq('id', tradeId);

      if (error) throw error;
      toast.success('Trade cancelled successfully');
      loadTrades();
    } catch (error) {
      console.error('Error cancelling trade:', error);
      toast.error('Failed to cancel trade');
    }
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'items', label: 'Items', icon: Package },
    { id: 'trades', label: 'Trades', icon: ArrowRightLeft },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <Shield className="w-12 h-12 text-red-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage users, items, trades, and game settings
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                User Management
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold">Username</th>
                        <th className="text-left py-3 px-4 font-semibold">Email</th>
                        <th className="text-left py-3 px-4 font-semibold">Score</th>
                        <th className="text-left py-3 px-4 font-semibold">Coins</th>
                        <th className="text-left py-3 px-4 font-semibold">Gems</th>
                        <th className="text-left py-3 px-4 font-semibold">Role</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">{user.username}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">{user.game_progress?.[0]?.score?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-4">{user.game_progress?.[0]?.coins?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-4">{user.game_progress?.[0]?.gems?.toLocaleString() || '0'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => resetUserProgress(user.id)}
                                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                              >
                                Reset
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  Item Management
                </h2>
                <button
                  onClick={() => setShowItemModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{item.image_url}</div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-200">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                      </div>
                      
                      <div className="flex justify-center mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRarityColor(item.rarity)}`}>
                          {item.rarity.toUpperCase()}
                        </span>
                      </div>

                      {item.effect_type && (
                        <div className="text-center mb-3 text-sm text-gray-600 dark:text-gray-400">
                          +{item.effect_value} {item.effect_type.replace('_', ' ')}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({
                              name: item.name,
                              description: item.description,
                              rarity: item.rarity as any,
                              effect_type: item.effect_type as any || 'click_power',
                              effect_value: item.effect_value,
                              image_url: item.image_url,
                            });
                            setShowItemModal(true);
                          }}
                          className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          <Edit className="w-3 h-3 inline mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Trade Management
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.map((trade) => (
                    <div key={trade.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200">
                            {trade.sender.username} → {trade.receiver.username}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(trade.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            trade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            trade.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            trade.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {trade.status.toUpperCase()}
                          </span>
                          {trade.status === 'pending' && (
                            <button
                              onClick={() => cancelTrade(trade.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Offers:</p>
                          {trade.offered_item ? (
                            <div>
                              <div className="text-xl">{trade.offered_item.image_url}</div>
                              <div className="text-sm font-semibold">{trade.offered_item.name}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">Nothing</div>
                          )}
                        </div>

                        <div className="text-center">
                          <ArrowRightLeft className="w-4 h-4 text-gray-400 mx-auto" />
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Wants:</p>
                          {trade.requested_item ? (
                            <div>
                              <div className="text-xl">{trade.requested_item.image_url}</div>
                              <div className="text-sm font-semibold">{trade.requested_item.name}</div>
                            </div>
                          ) : (
                            <div className="text-gray-500 italic">Anything</div>
                          )}
                        </div>
                      </div>

                      {trade.message && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-700 dark:text-gray-300">"{trade.message}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                Game Settings
              </h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Gacha Costs
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Basic:</span> 100 coins
                    </div>
                    <div>
                      <span className="font-medium">Premium:</span> 500 coins
                    </div>
                    <div>
                      <span className="font-medium">Legendary:</span> 1 gem
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Starting Resources
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Coins:</span> 0
                    </div>
                    <div>
                      <span className="font-medium">Gems:</span> 10
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    System Status
                  </h3>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    All systems operational. Database connected successfully.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
                {editingItem ? 'Edit Item' : 'Create Item'}
              </h3>

              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rarity
                  </label>
                  <select
                    value={itemForm.rarity}
                    onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Effect Type
                  </label>
                  <select
                    value={itemForm.effect_type}
                    onChange={(e) => setItemForm({ ...itemForm, effect_type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="click_power">Click Power</option>
                    <option value="auto_power">Auto Power</option>
                    <option value="coin_multiplier">Coin Multiplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Effect Value
                  </label>
                  <input
                    type="number"
                    value={itemForm.effect_value}
                    onChange={(e) => setItemForm({ ...itemForm, effect_value: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image (Emoji)
                  </label>
                  <input
                    type="text"
                    value={itemForm.image_url}
                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemModal(false);
                      setEditingItem(null);
                      setItemForm({
                        name: '',
                        description: '',
                        rarity: 'common',
                        effect_type: 'click_power',
                        effect_value: 1,
                        image_url: '🎁',
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    {editingItem ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}