import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Trophy, Target, Zap, RotateCcw, LogOut, Trash2, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useGameProgress } from '../hooks/useGameProgress';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { progress, resetProgress } = useGameProgress();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  const handleResetProgress = async () => {
    const success = await resetProgress();
    if (success) {
      setShowResetConfirm(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const stats = [
    { label: 'Total Score', value: progress?.score.toLocaleString() || '0', icon: Trophy, color: 'text-purple-600 dark:text-purple-400' },
    { label: 'Total Clicks', value: progress?.clicks.toLocaleString() || '0', icon: Target, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Click Power', value: progress?.click_power.toString() || '1', icon: Zap, color: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Auto Clickers', value: progress?.auto_clickers.toString() || '0', icon: RotateCcw, color: 'text-green-600 dark:text-green-400' },
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
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {profile.username}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome to your profile dashboard
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Info */}
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{profile.username}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
              Game Statistics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                  whileHover={{ scale: 1.05 }}
                >
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {progress && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Total Coins
                  </div>
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {progress.coins.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Settings */}
        <motion.div
          className="mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
            Settings
          </h2>
          
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Theme
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current: {theme === 'light' ? 'Light' : 'Dark'} mode
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Switch to {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>

            {/* Reset Progress */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Reset Progress
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This will reset all your game progress
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reset
              </button>
            </div>

            {/* Sign Out */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    Sign Out
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sign out of your account
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-center mb-6">
                <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Reset Progress?
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This will permanently delete all your game progress, including score, clicks, upgrades, and coins. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetProgress}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reset Everything
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}