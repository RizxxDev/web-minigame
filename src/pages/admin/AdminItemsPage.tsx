import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Item } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminItemsPage() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rarityFilter, setRarityFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    rarity: 'common' as const,
    effect_type: 'click_power' as const,
    effect_value: 1,
    image_url: '🎁',
    drop_rate_basic: 10.0,
    drop_rate_premium: 15.0,
    drop_rate_legendary: 20.0,
  });

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadItems();
  }, []);

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
      resetForm();
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

  const resetForm = () => {
    setItemForm({
      name: '',
      description: '',
      rarity: 'common',
      effect_type: 'click_power',
      effect_value: 1,
      image_url: '🎁',
      drop_rate_basic: 10.0,
      drop_rate_premium: 15.0,
      drop_rate_legendary: 20.0,
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'rare': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'epic': return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'legendary': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
    return matchesSearch && matchesRarity;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Package className="w-8 h-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-white">Item Management</h1>
          </div>
          <button
            onClick={() => setShowItemModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
        <p className="text-gray-400">
          Create and manage game items with their effects and drop rates
        </p>
      </motion.div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={rarityFilter}
            onChange={(e) => setRarityFilter(e.target.value as typeof rarityFilter)}
            className="pl-10 pr-8 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['common', 'rare', 'epic', 'legendary'].map((rarity) => (
          <div key={rarity} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="text-center">
              <p className={`text-sm font-semibold ${getRarityColor(rarity).split(' ')[0]} mb-1`}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </p>
              <p className="text-2xl font-bold text-white">
                {items.filter(item => item.rarity === rarity).length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all hover:shadow-lg ${getRarityColor(item.rarity).split(' ').slice(1).join(' ')}`}
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{item.image_url}</div>
                  <h3 className="font-bold text-white text-lg mb-1">{item.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRarityColor(item.rarity)}`}>
                    {item.rarity.toUpperCase()}
                  </span>
                </div>

                {item.effect_type && (
                  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Effect</p>
                      <p className="font-semibold text-white">
                        +{item.effect_value} {item.effect_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-4 text-xs text-gray-400">
                  <div className="grid grid-cols-3 gap-1 text-center">
                    <div>
                      <p>Basic</p>
                      <p className="font-semibold text-white">{item.drop_rate_basic}%</p>
                    </div>
                    <div>
                      <p>Premium</p>
                      <p className="font-semibold text-white">{item.drop_rate_premium}%</p>
                    </div>
                    <div>
                      <p>Legendary</p>
                      <p className="font-semibold text-white">{item.drop_rate_legendary}%</p>
                    </div>
                  </div>
                </div>

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
                        drop_rate_basic: item.drop_rate_basic || 10.0,
                        drop_rate_premium: item.drop_rate_premium || 15.0,
                        drop_rate_legendary: item.drop_rate_legendary || 20.0,
                      });
                      setShowItemModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Edit className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Trash2 className="w-3 h-3 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No items found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </motion.div>

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingItem ? 'Edit Item' : 'Create Item'}
            </h3>

            <form onSubmit={handleItemSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image (Emoji)
                  </label>
                  <input
                    type="text"
                    value={itemForm.image_url}
                    onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rarity
                  </label>
                  <select
                    value={itemForm.rarity}
                    onChange={(e) => setItemForm({ ...itemForm, rarity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="common">Common</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Effect Type
                  </label>
                  <select
                    value={itemForm.effect_type}
                    onChange={(e) => setItemForm({ ...itemForm, effect_type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="click_power">Click Power</option>
                    <option value="auto_power">Auto Power</option>
                    <option value="coin_multiplier">Coin Multiplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Effect Value
                  </label>
                  <input
                    type="number"
                    value={itemForm.effect_value}
                    onChange={(e) => setItemForm({ ...itemForm, effect_value: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                  Drop Rates (%)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Basic Gacha</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.drop_rate_basic}
                      onChange={(e) => setItemForm({ ...itemForm, drop_rate_basic: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Premium Gacha</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.drop_rate_premium}
                      onChange={(e) => setItemForm({ ...itemForm, drop_rate_premium: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Legendary Gacha</label>
                    <input
                      type="number"
                      step="0.01"
                      value={itemForm.drop_rate_legendary}
                      onChange={(e) => setItemForm({ ...itemForm, drop_rate_legendary: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowItemModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}