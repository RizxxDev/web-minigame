import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, User, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, type LeaderboardEntry } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const { user } = useAuth();

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order('score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
        toast.error('Failed to load leaderboard');
        return;
      }

      if (data) {
        setLeaderboard(data as LeaderboardEntry[]);
        
        // Find user's rank if they're logged in
        if (user) {
          const userIndex = data.findIndex(entry => entry.user_id === user.id);
          setUserRank(userIndex >= 0 ? userIndex + 1 : null);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-400" />;
      case 3:
        return <Award className="w-8 h-8 text-amber-600" />;
      default:
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankStyle = (rank: number, isUser: boolean) => {
    let baseStyle = "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg transition-all hover:shadow-xl ";
    
    if (isUser) {
      baseStyle += "ring-2 ring-purple-500 dark:ring-purple-400 bg-purple-50/80 dark:bg-purple-900/20 ";
    }

    switch (rank) {
      case 1:
        return baseStyle + "border-2 border-yellow-400";
      case 2:
        return baseStyle + "border-2 border-gray-300";
      case 3:
        return baseStyle + "border-2 border-amber-500";
      default:
        return baseStyle;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 relative z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center space-x-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Leaderboard
            </h1>
          </motion.div>
          
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Top 10 players competing for glory!
          </p>

          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* User's Rank (if not in top 10) */}
        {user && userRank && userRank > 10 && (
          <motion.div
            className="mb-6 p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border border-purple-300 dark:border-purple-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-center text-purple-700 dark:text-purple-300">
              <User className="w-6 h-6 inline-block mr-2" />
              Your current rank: #{userRank}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
          </div>
        )}

        {/* Leaderboard */}
        {!loading && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No players yet!
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Be the first to start playing and claim the top spot!
                </p>
              </div>
            ) : (
              leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isUser = user?.id === entry.user_id;

                return (
                  <motion.div
                    key={entry.id}
                    className={getRankStyle(rank, isUser)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getRankIcon(rank)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                              {entry.profiles?.username || 'Unknown Player'}
                            </h3>
                            {isUser && (
                              <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>Clicks: {entry.clicks.toLocaleString()}</span>
                            <span>Power: {entry.click_power}</span>
                            <span>Auto: {entry.auto_clickers}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-500">
                          points
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Footer Message */}
        <motion.div
          className="text-center mt-12 p-6 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Ready to compete?
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Start playing now and climb your way to the top of the leaderboard!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
