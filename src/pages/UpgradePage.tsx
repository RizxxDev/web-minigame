import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Zap, Coins, ArrowUp, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from '../hooks/useGameProgress';
import { useInventory } from '../hooks/useInventory';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function UpgradePage() {
  const { user } = useAuth();
  const { progress, saveProgress, loadProgress } = useGameProgress();
  const { upgradeInventorySlot, getInventorySlotCost } = useInventory();

  const [localProgress, setLocalProgress] = useState({
    score: 0,
    clicks: 0,
    click_power: 1,
    auto_clickers: 0,
    auto_click_power: 1,
    coins: 0,
    gems: 0,
    total_spent: 0,
  });

  // Update local progress when database progress loads
  useEffect(() => {
    if (progress) {
      setLocalProgress({
        score: progress.score,
        clicks: progress.clicks,
        click_power: progress.click_power,
        auto_clickers: progress.auto_clickers,
        auto_click_power: progress.auto_click_power,
        coins: progress.coins,
        gems: progress.gems,
        total_spent: progress.total_spent,
      });
    }
  }, [progress]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Refetch progress after upgrading
  const reloadProgress = async () => {
    try {
      await loadProgress(); // This loads the updated progress
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to reload progress');
    }
  };

  const upgradeEquipSlot = async () => {
    if (!progress) return;

    const cost = Math.floor(200 * Math.pow(2, progress.max_equip - 3));
    
    if (progress.coins < cost) {
      toast.error('Not enough coins!');
      return;
    }

    try {
      const updatedProgress = {
        ...progress,
        coins: progress.coins - cost,
        max_equip: progress.max_equip + 1,
      };

      await saveProgress(updatedProgress);
      toast.success('Equipment slot upgraded!');
    } catch (error) {
      console.error('Error upgrading equipment:', error);
      toast.error('Failed to upgrade equipment slot');
    }
  };

  const getEquipSlotCost = () => {
    if (!progress) return 0;
    return Math.floor(200 * Math.pow(2, progress.max_equip - 3));
  };

  const upgrades = [
    {
      id: 'inventory',
      name: 'Inventory Slots',
      description: 'Increase your maximum inventory capacity',
      icon: Package,
      current: progress?.max_inventory || 20,
      cost: getInventorySlotCost(),
      currency: 'coins',
      action: upgradeInventorySlot,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'equip',
      name: 'Equipment Slots',
      description: 'Equip more items simultaneously',
      icon: Zap,
      current: progress?.max_equip || 3,
      cost: getEquipSlotCost(),
      currency: 'coins',
      action: upgradeEquipSlot,
      color: 'from-purple-500 to-pink-500',
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <TrendingUp className="w-12 h-12 text-green-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Upgrades
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Expand your capabilities and inventory
          </p>
        </motion.div>

        {/* Currency Display */}
        <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <Coins className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {localProgress.coins.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Coins</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <Package className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {progress?.gems?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gems</div>
          </div>
        </div>

        {/* Upgrades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {upgrades.map((upgrade, index) => (
            <motion.div
              key={upgrade.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${upgrade.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <upgrade.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {upgrade.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {upgrade.description}
                </p>
              </div>

              {/* Current Level */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Current Level
                  </span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {upgrade.current}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 bg-gradient-to-r ${upgrade.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min((upgrade.current / (upgrade.current + 5)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Next Level Preview */}
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Next Level:
                  </span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {upgrade.current + 1}
                  </span>
                </div>
              </div>

              {/* Upgrade Button */}
              <motion.button
                onClick={upgrade.action}
                disabled={!progress || progress.coins < upgrade.cost}
                className={`w-full py-3 px-4 bg-gradient-to-r ${upgrade.color} text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl`}
                whileHover={{ scale: progress && progress.coins >= upgrade.cost ? 1.02 : 1 }}
                whileTap={{ scale: progress && progress.coins >= upgrade.cost ? 0.98 : 1 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <ArrowUp className="w-4 h-4" />
                  <Coins className="w-4 h-4" />
                  <span>{upgrade.cost.toLocaleString()}</span>
                </div>
              </motion.button>

              {progress && progress.coins < upgrade.cost && (
                <p className="text-red-500 text-xs text-center mt-2">
                  Need {(upgrade.cost - progress.coins).toLocaleString()} more coins!
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          className="mt-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 text-center">
            💡 Upgrade Tips
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-2">
              <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Inventory Slots:</strong> More slots let you collect more items from gacha without worrying about space.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Zap className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Equipment Slots:</strong> Equip more items simultaneously to stack their effects and boost your performance.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
