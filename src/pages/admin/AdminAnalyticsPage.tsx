import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Coins, Gem, Users, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';

interface CurrencyData {
  date: string;
  coins: number;
  gems: number;
  coins_change: number;
  gems_change: number;
}

interface EconomyStats {
  total_coins: number;
  total_gems: number;
  active_players: number;
  total_trades: number;
  coins_trend: number;
  gems_trend: number;
}

export default function AdminAnalyticsPage() {
  const { user, profile } = useAuth();
  const [currencyData, setCurrencyData] = useState<CurrencyData[]>([]);
  const [stats, setStats] = useState<EconomyStats>({
    total_coins: 0,
    total_gems: 0,
    active_players: 0,
    total_trades: 0,
    coins_trend: 0,
    gems_trend: 0,
  });
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'cumulative' | 'daily'>('cumulative');

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load economy stats
      const { data: progressData } = await supabase
        .from('game_progress')
        .select('coins, gems');

      const { data: tradesData } = await supabase
        .from('trades')
        .select('id');

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id');

      if (progressData && tradesData && usersData) {
        const totalCoins = progressData.reduce((sum, p) => sum + (p.coins || 0), 0);
        const totalGems = progressData.reduce((sum, p) => sum + (p.gems || 0), 0);

        setStats({
          total_coins: totalCoins,
          total_gems: totalGems,
          active_players: progressData.length,
          total_trades: tradesData.length,
          coins_trend: Math.random() * 20 - 10, // Mock trend data
          gems_trend: Math.random() * 20 - 10, // Mock trend data
        });

        // Generate mock historical data for the chart
        const mockData: CurrencyData[] = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          
          const baseCoins = totalCoins * (0.7 + (29 - i) * 0.01);
          const baseGems = totalGems * (0.7 + (29 - i) * 0.01);
          
          mockData.push({
            date: date.toISOString().split('T')[0],
            coins: Math.floor(baseCoins),
            gems: Math.floor(baseGems),
            coins_change: Math.floor(Math.random() * 1000 - 500),
            gems_change: Math.floor(Math.random() * 50 - 25),
          });
        }
        setCurrencyData(mockData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const maxCoins = Math.max(...currencyData.map(d => viewMode === 'cumulative' ? d.coins : d.coins_change));
  const maxGems = Math.max(...currencyData.map(d => viewMode === 'cumulative' ? d.gems : d.gems_change));

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8 text-cyan-500" />
          <h1 className="text-3xl font-bold text-white">Currency Analytics</h1>
        </div>
        <p className="text-gray-400">
          Monitor the game economy and currency circulation
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Coins</p>
              <p className="text-2xl font-bold text-yellow-400">
                {stats.total_coins.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {stats.coins_trend >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm ${stats.coins_trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(stats.coins_trend).toFixed(1)}%
                </span>
              </div>
            </div>
            <Coins className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Gems</p>
              <p className="text-2xl font-bold text-blue-400">
                {stats.total_gems.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {stats.gems_trend >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                )}
                <span className={`text-sm ${stats.gems_trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {Math.abs(stats.gems_trend).toFixed(1)}%
                </span>
              </div>
            </div>
            <Gem className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Players</p>
              <p className="text-2xl font-bold text-green-400">
                {stats.active_players.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">With progress</p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Trades</p>
              <p className="text-2xl font-bold text-purple-400">
                {stats.total_trades.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </motion.div>
      </div>

      {/* Chart Controls */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">Currency Circulation (Last 30 Days)</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'cumulative'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Cumulative
          </button>
          <button
            onClick={() => setViewMode('daily')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              viewMode === 'daily'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Daily Change
          </button>
        </div>
      </div>

      {/* Chart */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading analytics...</p>
          </div>
        ) : (
          <div className="h-96 relative">
            {/* Chart Legend */}
            <div className="flex items-center space-x-6 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Coins</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Gems</span>
              </div>
            </div>

            {/* Simple Line Chart */}
            <div className="relative h-80 bg-gray-900/50 rounded-lg p-4">
              <svg className="w-full h-full" viewBox="0 0 800 300">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="0"
                    y1={i * 60}
                    x2="800"
                    y2={i * 60}
                    stroke="#374151"
                    strokeWidth="1"
                    opacity="0.3"
                  />
                ))}

                {/* Coins line */}
                <polyline
                  fill="none"
                  stroke="#EAB308"
                  strokeWidth="2"
                  points={currencyData.map((d, i) => {
                    const x = (i / (currencyData.length - 1)) * 800;
                    const value = viewMode === 'cumulative' ? d.coins : d.coins_change;
                    const y = 300 - (value / (viewMode === 'cumulative' ? maxCoins : Math.max(Math.abs(maxCoins), 1000))) * 280;
                    return `${x},${Math.max(10, Math.min(290, y))}`;
                  }).join(' ')}
                />

                {/* Gems line */}
                <polyline
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  points={currencyData.map((d, i) => {
                    const x = (i / (currencyData.length - 1)) * 800;
                    const value = viewMode === 'cumulative' ? d.gems : d.gems_change;
                    const y = 300 - (value / (viewMode === 'cumulative' ? maxGems : Math.max(Math.abs(maxGems), 100))) * 280;
                    return `${x},${Math.max(10, Math.min(290, y))}`;
                  }).join(' ')}
                />
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
                <span>{currencyData[0]?.date}</span>
                <span>{currencyData[Math.floor(currencyData.length / 2)]?.date}</span>
                <span>{currencyData[currencyData.length - 1]?.date}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Economy Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Currency Distribution</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Average coins per player:</span>
                <span className="text-white font-semibold">
                  {stats.active_players > 0 ? Math.floor(stats.total_coins / stats.active_players).toLocaleString() : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average gems per player:</span>
                <span className="text-white font-semibold">
                  {stats.active_players > 0 ? Math.floor(stats.total_gems / stats.active_players).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">Market Activity</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Trades per player:</span>
                <span className="text-white font-semibold">
                  {stats.active_players > 0 ? (stats.total_trades / stats.active_players).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Economy health:</span>
                <span className="text-green-400 font-semibold">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}