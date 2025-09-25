import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gem, Coins, Gift, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from '../hooks/useGameProgress';
import { useGacha, type GachaTier, type GachaResult } from '../hooks/useGacha';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function GachaPage() {
  const { user } = useAuth();
  const { progress, saveProgress } = useGameProgress();
  const { pullGacha, loading, gachaCosts } = useGacha();
  const [gachaResult, setGachaResult] = useState<GachaResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [localProgress, setLocalProgress] = useState({
    coins: 0,
    gems: 0,
    total_spent: 0,
  });

  // Update local progress when database progress loads
  useEffect(() => {
    if (progress) {
      setLocalProgress({
        coins: progress.coins,
        gems: progress.gems,
        total_spent: progress.total_spent,
      });
    }
  }, [progress]);

  // Save progress to database after changes
  useEffect(() => {
    if (user && progress && (
      localProgress.coins !== progress.coins || 
      localProgress.gems !== progress.gems ||
      localProgress.total_spent !== progress.total_spent
    )) {
      const timeoutId = setTimeout(() => {
        saveProgress({
          ...progress,
          coins: localProgress.coins,
          gems: localProgress.gems,
          total_spent: localProgress.total_spent,
        });
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [user, progress, localProgress, saveProgress]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleGachaPull = async (tier: GachaTier) => {
    const cost = gachaCosts[tier];
    
    // Check if user has enough currency
    if (cost.type === 'coins' && localProgress.coins < cost.amount) {
      toast.error('Not enough coins!');
      return;
    }
    if (cost.type === 'gems' && localProgress.gems < cost.amount) {
      toast.error('Not enough gems!');
      return;
    }

    // Update local state immediately (optimistic update)
    setLocalProgress(prev => ({
      ...prev,
      [cost.type]: prev[cost.type] - cost.amount,
      total_spent: prev.total_spent + cost.amount,
    }));

    const result = await pullGacha(tier);
    if (result) {
      setGachaResult(result);
      setShowResult(true);
    } else {
      // Revert local state if gacha failed
      setLocalProgress(prev => ({
        ...prev,
        [cost.type]: prev[cost.type] + cost.amount,
        total_spent: prev.total_spent - cost.amount,
      }));
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-300';
      case 'rare': return 'text-blue-500 border-blue-300';
      case 'epic': return 'text-purple-500 border-purple-300';
      case 'legendary': return 'text-yellow-500 border-yellow-300';
      default: return 'text-gray-500 border-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-200';
      case 'rare': return 'shadow-blue-200 shadow-lg';
      case 'epic': return 'shadow-purple-200 shadow-xl';
      case 'legendary': return 'shadow-yellow-200 shadow-2xl';
      default: return 'shadow-gray-200';
    }
  };

  const gachaTiers = [
    {
      id: 'basic' as GachaTier,
      name: 'Basic Gacha',
      description: 'Common items with occasional surprises',
      cost: gachaCosts.basic,
      icon: Gift,
      gradient: 'from-gray-400 to-gray-600',
      rates: { common: '70%', rare: '25%', epic: '4%', legendary: '1%' },
    },
    {
      id: 'premium' as GachaTier,
      name: 'Premium Gacha',
      description: 'Better odds for rare and epic items',
      cost: gachaCosts.premium,
      icon: Sparkles,
      gradient: 'from-blue-400 to-purple-600',
      rates: { common: '40%', rare: '40%', epic: '15%', legendary: '5%' },
    },
    {
      id: 'legendary' as GachaTier,
      name: 'Legendary Gacha',
      description: 'Highest chance for legendary items',
      cost: gachaCosts.legendary,
      icon: Star,
      gradient: 'from-yellow-400 to-orange-600',
      rates: { common: '20%', rare: '30%', epic: '30%', legendary: '20%' },
    },
  ];

  const canAfford = (tier: GachaTier) => {
    if (!localProgress) return false;
    const cost = gachaCosts[tier];
    return cost.type === 'coins' ? localProgress.coins >= cost.amount : localProgress.gems >= cost.amount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gacha System
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Try your luck and collect amazing items!
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
            <Gem className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {localProgress.gems.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gems</div>
          </div>
        </div>

        {/* Gacha Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {gachaTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <tier.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {tier.description}
                </p>
              </div>

              {/* Rates */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Drop Rates:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Common:</span>
                    <span className="font-semibold">{tier.rates.common}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-500">Rare:</span>
                    <span className="font-semibold">{tier.rates.rare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-500">Epic:</span>
                    <span className="font-semibold">{tier.rates.epic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-500">Legendary:</span>
                    <span className="font-semibold">{tier.rates.legendary}</span>
                  </div>
                </div>
              </div>

              {/* Pull Button */}
              <motion.button
                onClick={() => handleGachaPull(tier.id)}
                disabled={loading || !canAfford(tier.id)}
                className={`w-full py-3 px-4 bg-gradient-to-r ${tier.gradient} text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl`}
                whileHover={{ scale: canAfford(tier.id) ? 1.02 : 1 }}
                whileTap={{ scale: canAfford(tier.id) ? 0.98 : 1 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  {tier.cost.type === 'coins' ? (
                    <Coins className="w-4 h-4" />
                  ) : (
                    <Gem className="w-4 h-4" />
                  )}
                  <span>{tier.cost.amount.toLocaleString()}</span>
                </div>
              </motion.button>

              {!canAfford(tier.id) && (
                <p className="text-red-500 text-xs text-center mt-2">
                  Not enough {tier.cost.type}!
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Gacha Result Modal */}
        <AnimatePresence>
          {showResult && gachaResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div
                className={`bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center ${getRarityGlow(gachaResult.item.rarity)}`}
                initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="mb-6"
                  animate={{ 
                    rotate: gachaResult.item.rarity === 'legendary' ? [0, 360] : 0,
                    scale: gachaResult.item.rarity === 'epic' || gachaResult.item.rarity === 'legendary' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ 
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                  }}
                >
                  <div className={`text-8xl mb-4 ${gachaResult.item.rarity === 'legendary' ? 'animate-pulse' : ''}`}>
                    {gachaResult.item.image_url}
                  </div>
                </motion.div>

                <h3 className={`text-2xl font-bold mb-2 ${getRarityColor(gachaResult.item.rarity).split(' ')[0]}`}>
                  {gachaResult.item.name}
                </h3>
                
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 border-2 ${getRarityColor(gachaResult.item.rarity)}`}>
                  {gachaResult.item.rarity.toUpperCase()}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {gachaResult.item.description}
                </p>

                {gachaResult.item.effect_type && (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Effect: +{gachaResult.item.effect_value} {gachaResult.item.effect_type.replace('_', ' ')}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowResult(false)}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Awesome!
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
