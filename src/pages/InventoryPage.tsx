import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Zap, Target, Coins, CheckCircle, Circle, ArrowUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { useGameProgress } from '../hooks/useGameProgress';
import { Navigate } from 'react-router-dom';

export default function InventoryPage() {
  const { user } = useAuth();
  const { inventory, loading, equipItem, upgradeInventorySlot, getInventorySlotCost } = useInventory();
  const { progress } = useGameProgress();
  const [filter, setFilter] = useState<'all' | 'equipped' | 'common' | 'rare' | 'epic' | 'legendary'>('all');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
      case 'rare': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
      case 'epic': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20';
      case 'legendary': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 dark:text-gray-400';
      case 'rare': return 'text-blue-600 dark:text-blue-400';
      case 'epic': return 'text-purple-600 dark:text-purple-400';
      case 'legendary': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getEffectIcon = (effectType: string | null) => {
    switch (effectType) {
      case 'click_power': return Target;
      case 'auto_power': return Zap;
      case 'coin_multiplier': return Coins;
      default: return Package;
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'equipped') return item.is_equipped;
    return item.items.rarity === filter;
  });

  const handleEquipToggle = async (inventoryId: string, currentlyEquipped: boolean) => {
    await equipItem(inventoryId, !currentlyEquipped);
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
            <Package className="w-12 h-12 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Inventory
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage your collected items and equipment
          </p>
          
          {/* Inventory Stats */}
          <div className="flex justify-center space-x-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)} / {progress?.max_inventory || 20}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {inventory.filter(item => item.is_equipped).length} / {progress?.max_equip || 3}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Equipped</div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['all', 'equipped', 'common', 'rare', 'epic', 'legendary'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption as typeof filter)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filter === filterOption
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {filter === 'all' ? 'No items yet!' : `No ${filter} items found`}
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {filter === 'all' 
                ? 'Try pulling some gacha to get your first items!'
                : 'Try a different filter or pull more gacha!'
              }
            </p>
          </div>
        )}

        {/* Inventory Grid */}
        {!loading && filteredInventory.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredInventory.map((inventoryItem, index) => {
              const EffectIcon = getEffectIcon(inventoryItem.items.effect_type);
              
              return (
                <motion.div
                  key={inventoryItem.id}
                  className={`relative rounded-xl p-4 border-2 transition-all hover:shadow-lg ${getRarityColor(inventoryItem.items.rarity)} ${
                    inventoryItem.is_equipped ? 'ring-2 ring-green-500' : ''
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Equipped Badge */}
                  {inventoryItem.is_equipped && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      EQUIPPED
                    </div>
                  )}

                  {/* Item Image */}
                  <div className="text-center mb-3">
                    <div className="text-4xl mb-2">
                      {inventoryItem.items.image_url}
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {inventoryItem.items.name}
                    </h3>
                  </div>

                  {/* Rarity */}
                  <div className={`text-center mb-3 ${getRarityTextColor(inventoryItem.items.rarity)}`}>
                    <div className="text-xs font-semibold uppercase tracking-wide">
                      {inventoryItem.items.rarity}
                    </div>
                  </div>

                  {/* Effect */}
                  {inventoryItem.items.effect_type && (
                    <div className="flex items-center justify-center space-x-1 mb-3 text-xs text-gray-600 dark:text-gray-400">
                      <EffectIcon className="w-3 h-3" />
                      <span>+{inventoryItem.items.effect_value}</span>
                    </div>
                  )}

                  {/* Quantity */}
                  {inventoryItem.quantity > 1 && (
                    <div className="text-center mb-3">
                      <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs font-semibold">
                        x{inventoryItem.quantity}
                      </span>
                    </div>
                  )}

                  {/* Equip Button */}
                  <motion.button
                    onClick={() => handleEquipToggle(inventoryItem.id, inventoryItem.is_equipped)}
                    className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-all flex items-center justify-center space-x-1 ${
                      inventoryItem.is_equipped
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {inventoryItem.is_equipped ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span>Unequip</span>
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3" />
                        <span>Equip</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Stats Summary */}
        {!loading && inventory.length > 0 && (
          <motion.div
            className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
              Collection Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {inventory.filter(item => item.items.rarity === 'common').length}
                </div>
                <div className="text-sm text-gray-500">Common</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {inventory.filter(item => item.items.rarity === 'rare').length}
                </div>
                <div className="text-sm text-gray-500">Rare</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {inventory.filter(item => item.items.rarity === 'epic').length}
                </div>
                <div className="text-sm text-gray-500">Epic</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {inventory.filter(item => item.items.rarity === 'legendary').length}
                </div>
                <div className="text-sm text-gray-500">Legendary</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
