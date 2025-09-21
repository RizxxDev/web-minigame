import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Zap, Target, Coins, ShoppingCart, RotateCcw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from '../hooks/useGameProgress';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function PlayPage() {
  const { user } = useAuth();
  const { progress, saveProgress } = useGameProgress();
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
  const [clickAnimations, setClickAnimations] = useState<{ id: number; x: number; y: number }[]>([]);
  const [animationCounter, setAnimationCounter] = useState(0);
  const [showShop, setShowShop] = useState(false);

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

  // Auto-clicker effect
  useEffect(() => {
    if (localProgress.auto_clickers > 0) {
      const interval = setInterval(() => {
        const autoEarnings = localProgress.auto_clickers * localProgress.auto_click_power;
        setLocalProgress(prev => ({
          ...prev,
          score: prev.score + autoEarnings,
          coins: prev.coins + Math.floor(autoEarnings / 10),
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [localProgress.auto_clickers, localProgress.auto_click_power]);

  // Save progress to database periodically
  useEffect(() => {
    if (user && progress) {
      const interval = setInterval(() => {
        saveProgress(localProgress);
      }, 250); // Save every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, progress, localProgress, saveProgress]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add click animation
    const newAnimation = {
      id: animationCounter,
      x,
      y,
    };

    setClickAnimations(prev => [...prev, newAnimation]);
    setAnimationCounter(prev => prev + 1);

    // Remove animation after it completes
    setTimeout(() => {
      setClickAnimations(prev => prev.filter(anim => anim.id !== newAnimation.id));
    }, 1000);

    // Update progress
    setLocalProgress(prev => ({
      ...prev,
      score: prev.score + prev.click_power,
      clicks: prev.clicks + 1,
      coins: prev.coins + Math.floor(prev.click_power / 5),
      gems: prev.gems + (Math.random() < 0.01 ? 1 : 0), // 1% chance to get 1 gem
    }));
  }, [animationCounter, localProgress.click_power]);

  const upgrades = [
    {
      id: 'click_power',
      name: 'Click Power',
      description: 'Increase your click power',
      icon: Target,
      cost: Math.floor(100 * Math.pow(1.5, localProgress.click_power - 1)),
      current: localProgress.click_power,
    },
    {
      id: 'auto_clicker',
      name: 'Auto Clicker',
      description: 'Clicks automatically every second',
      icon: RotateCcw,
      cost: Math.floor(500 * Math.pow(2, localProgress.auto_clickers)),
      current: localProgress.auto_clickers,
    },
    {
      id: 'auto_power',
      name: 'Auto Power',
      description: 'Increase auto-clicker power',
      icon: Zap,
      cost: Math.floor(1000 * Math.pow(2.5, localProgress.auto_click_power - 1)),
      current: localProgress.auto_click_power,
    },
  ];

  const buyUpgrade = (upgradeId: string) => {
    const upgrade = upgrades.find(u => u.id === upgradeId);
    if (!upgrade || localProgress.clicks < upgrade.cost) {
      toast.error('Not enough coins!');
      return;
    }

    setLocalProgress(prev => {
      const newProgress = { ...prev };
      newProgress.clicks -= upgrade.cost;

      switch (upgradeId) {
        case 'click_power':
          newProgress.click_power += 1;
          break;
        case 'auto_clicker':
          newProgress.auto_clickers += 1;
          break;
        case 'auto_power':
          newProgress.auto_click_power += 1;
          break;
      }

      return newProgress;
    });

    toast.success(`Upgraded ${upgrade.name}!`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center px-4 relative z-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            You need to sign in to save your game progress and compete on the leaderboard.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Sign In to Play
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {localProgress.score.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {localProgress.clicks.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {localProgress.coins.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Coins</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {localProgress.gems.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gems</div>
          </div>
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {localProgress.click_power}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Power</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                Click to Score!
              </h2>
              
              <div className="relative inline-block">
                <motion.button
                  onClick={handleClick}
                  className="w-64 h-64 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-2xl hover:shadow-3xl transition-all text-white font-bold text-4xl relative overflow-hidden"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  CLICK
                  
                  {/* Click animations */}
                  <AnimatePresence>
                    {clickAnimations.map(animation => (
                      <motion.div
                        key={animation.id}
                        className="absolute pointer-events-none text-yellow-300 font-bold text-2xl"
                        initial={{ 
                          x: animation.x - 20, 
                          y: animation.y - 20, 
                          opacity: 1, 
                          scale: 0.5 
                        }}
                        animate={{ 
                          y: animation.y - 100, 
                          opacity: 0, 
                          scale: 1.5 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                      >
                        +{localProgress.click_power}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.button>
              </div>

              <div className="mt-8 text-gray-600 dark:text-gray-400">
                <p>Click the button to earn {localProgress.click_power} points per click!</p>
                {localProgress.auto_clickers > 0 && (
                  <p className="mt-2">
                    Auto-earning {localProgress.auto_clickers * localProgress.auto_click_power} points per second
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Shop</h3>
                <ShoppingCart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="space-y-4">
                {upgrades.map(upgrade => (
                  <div
                    key={upgrade.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-purple-500 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <upgrade.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                            {upgrade.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {upgrade.description}
                          </p>
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Current: {upgrade.current}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={localProgress.clicks < upgrade.cost}
                      className="w-full mt-3 py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all"
                      whileHover={{ scale: localProgress.coins >= upgrade.cost ? 1.02 : 1 }}
                      whileTap={{ scale: localProgress.coins >= upgrade.cost ? 0.98 : 1 }}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Coins className="w-4 h-4" />
                        <span>{upgrade.cost.toLocaleString()}</span>
                      </div>
                    </motion.button>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  <p>Your progress is automatically saved!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


