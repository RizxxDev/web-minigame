import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, User, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Trade } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminTradesPage() {
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'>('all');

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          sender:sender_id (username),
          receiver:receiver_id (username),
          trade_items (
            *,
            items (*)
          )
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled': return <Ban className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'accepted': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredTrades = trades.filter(trade => 
    statusFilter === 'all' || trade.status === statusFilter
  );

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <ArrowRightLeft className="w-8 h-8 text-green-500" />
          <h1 className="text-3xl font-bold text-white">Trade Management</h1>
        </div>
        <p className="text-gray-400">
          Monitor and manage all player trades
        </p>
      </motion.div>

      {/* Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">All Trades</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-yellow-400 text-sm font-semibold mb-1">Pending</p>
            <p className="text-2xl font-bold text-white">
              {trades.filter(t => t.status === 'pending').length}
            </p>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-green-400 text-sm font-semibold mb-1">Accepted</p>
            <p className="text-2xl font-bold text-white">
              {trades.filter(t => t.status === 'accepted').length}
            </p>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-red-400 text-sm font-semibold mb-1">Rejected</p>
            <p className="text-2xl font-bold text-white">
              {trades.filter(t => t.status === 'rejected').length}
            </p>
          </div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-sm font-semibold mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{trades.length}</p>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trades...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div
                key={trade.id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold text-white">{trade.sender.username}</span>
                      <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-white">{trade.receiver.username}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${getStatusColor(trade.status)}`}>
                      {getStatusIcon(trade.status)}
                      <span>{trade.status.toUpperCase()}</span>
                    </span>
                    
                    {trade.status === 'pending' && (
                      <button
                        onClick={() => cancelTrade(trade.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Offered Items */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Offers:</p>
                    {trade.trade_items?.filter(item => item.type === 'offer').length > 0 ? (
                      <div className="space-y-2">
                        {trade.trade_items
                          .filter(item => item.type === 'offer')
                          .map((tradeItem) => (
                            <div
                              key={tradeItem.id}
                              className="bg-gray-700/50 rounded-lg p-2"
                            >
                              <div className="text-xl mb-1">{tradeItem.items.image_url}</div>
                              <div className="font-semibold text-xs text-white">{tradeItem.items.name}</div>
                              <div className="text-xs text-gray-400">x{tradeItem.quantity}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Nothing</div>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="text-center">
                    <ArrowRightLeft className="w-6 h-6 text-gray-400 mx-auto" />
                  </div>

                  {/* Requested Items */}
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-2">Wants:</p>
                    {trade.trade_items?.filter(item => item.type === 'request').length > 0 ? (
                      <div className="space-y-2">
                        {trade.trade_items
                          .filter(item => item.type === 'request')
                          .map((tradeItem) => (
                            <div
                              key={tradeItem.id}
                              className="bg-gray-700/50 rounded-lg p-2"
                            >
                              <div className="text-xl mb-1">{tradeItem.items.image_url}</div>
                              <div className="font-semibold text-xs text-white">{tradeItem.items.name}</div>
                              <div className="text-xs text-gray-400">x{tradeItem.quantity}</div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic">Anything</div>
                    )}
                  </div>
                </div>

                {trade.message && (
                  <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-300">"{trade.message}"</p>
                  </div>
                )}

                <div className="mt-4 text-xs text-gray-500 text-center">
                  Created: {new Date(trade.created_at).toLocaleString()}
                  {trade.updated_at !== trade.created_at && (
                    <> • Updated: {new Date(trade.updated_at).toLocaleString()}</>
                  )}
                </div>
              </div>
            ))}

            {filteredTrades.length === 0 && (
              <div className="text-center py-12">
                <ArrowRightLeft className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No trades found</h3>
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'No trades have been created yet.' 
                    : `No ${statusFilter} trades found.`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}