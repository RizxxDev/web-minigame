import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Trophy, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Play,
      title: 'Engaging Gameplay',
      description: 'Click your way to victory with satisfying animations and smooth gameplay.',
    },
    {
      icon: Zap,
      title: 'Power Upgrades',
      description: 'Upgrade your click power and unlock auto-clickers for passive income.',
    },
    {
      icon: Trophy,
      title: 'Global Leaderboard',
      description: 'Compete with players worldwide and climb to the top of the rankings.',
    },
    {
      icon: Users,
      title: 'Save Progress',
      description: 'Your progress is automatically saved to the cloud for seamless gameplay.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            ClickMaster
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The ultimate clicker game experience. Click, upgrade, compete, and dominate the leaderboards!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user ? '/play' : '/login'}
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              {user ? 'Start Playing' : 'Sign In to Play'}
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-lg font-semibold rounded-full hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all transform hover:scale-105"
            >
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              whileHover={{ y: -5 }}
            >
              <feature.icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Join the Community
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Thousands of players are already clicking their way to glory!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">1M+</div>
              <div className="text-gray-600 dark:text-gray-400">Total Clicks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-400">Active Players</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400">Online Fun</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
