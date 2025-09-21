import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Send, Check, X, User, Gift, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../hooks/useInventory';
import { useTrades } from '../hooks/useTrades';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function TradePage() {
  const { user } = useAuth();
  const { inventory } = useInventory();
  const { incomingTrades, outgoingTrades, loading, createTrade, acceptTrade, rejectTrade } = useTrades();
  const [activeTab, setActiveTab] = useState<'create' | 'incoming' | 'outgoing'>('create');
  const [tradeForm, setTradeForm] = useState({
    receiverUsername: '',
    offeredItemId: '',
    requestedItemId: '',
    message: '',
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tradeForm.receiverUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    const success = await createTrade(
      tradeForm.receiverUsername,
      tradeForm.offeredItemId || null,
      1,
      tradeForm.requestedItemId || null,
      1,
      tradeForm.message || undefined
    );

    if (success) {
      setTradeForm({
        receiverUsername: '',
        offeredItemId: '',
        requestedItemId: '',
        message: '',
      });
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 border-gray-300';
      case 'rare': return 'text-blue-600 border-blue-300';
      case 'epic': return 'text-purple-600 border-purple-300';
      case 'legendary': return 'text-yellow-600 border-yellow-300';
      default: return 'text-gray-600 border-gray-300';
    }
  };

  const tabs = [
    { id: 'create', label: 'Create Trade', icon: Send },
    { id: 'incoming', label: `Incoming (${incomingTrades.length})`, icon: Gift },
    { id: 'outgoing', label: `Outgoing (${outgoingTrades.length})`, icon: Clock },
  ];

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
            <ArrowRightLeft className="w-12 h-12 text-green-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Trading Center
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Trade items with other players
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-2 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Create Trade Tab */}
        {activeTab === 'create' && (
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center">
                Create New Trade
              </h2>

              <form onSubmit={handleCreateTrade} className="space-y-6">
                {/* Receiver Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Trade with (Username)
                  </label>
                  <input
                    type="text"
                    value={tradeForm.receiverUsername}
                    onChange={(e) => setTradeForm({ ...tradeForm, receiverUsername: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                    required
                  />
                </div>

                {/* Offered Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Offer (Optional)
                  </label>
                  <select
                    value={tradeForm.offeredItemId}
                    onChange={(e) => setTradeForm({ ...tradeForm, offeredItemId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select an item to offer</option>
                    {inventory.map((item) => (
                      <option key={item.id} value={item.item_id}>
                        {item.items.image_url} {item.items.name} ({item.items.rarity}) x{item.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Requested Item */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What You Want (Optional)
                  </label>
                  <input
                    type="text"
                    value={tradeForm.requestedItemId}
                    onChange={(e) => setTradeForm({ ...tradeForm, requestedItemId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what you want (optional)"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={tradeForm.message}
                    onChange={(e) => setTradeForm({ ...tradeForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add a message to your trade request..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send Trade Request</span>
                  </div>
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Incoming Trades Tab */}
        {activeTab === 'incoming' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {incomingTrades.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No incoming trades
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  When someone sends you a trade request, it will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingTrades.map((trade) => (
                  <motion.div
                    key={trade.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-blue-500" />
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200">
                            From: {trade.sender.username}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(trade.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => acceptTrade(trade.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => rejectTrade(trade.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Offered Item */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">They Offer:</p>
                        {trade.offered_item ? (
                          <div className={`border-2 rounded-lg p-3 ${getRarityColor(trade.offered_item.rarity)}`}>
                            <div className="text-2xl mb-1">{trade.offered_item.image_url}</div>
                            <div className="font-semibold text-sm">{trade.offered_item.name}</div>
                            <div className="text-xs opacity-75">{trade.offered_item.rarity}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">Nothing</div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-center">
                        <ArrowRightLeft className="w-6 h-6 text-gray-400 mx-auto" />
                      </div>

                      {/* Requested Item */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">They Want:</p>
                        {trade.requested_item ? (
                          <div className={`border-2 rounded-lg p-3 ${getRarityColor(trade.requested_item.rarity)}`}>
                            <div className="text-2xl mb-1">{trade.requested_item.image_url}</div>
                            <div className="font-semibold text-sm">{trade.requested_item.name}</div>
                            <div className="text-xs opacity-75">{trade.requested_item.rarity}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">Anything</div>
                        )}
                      </div>
                    </div>

                    {trade.message && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{trade.message}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Outgoing Trades Tab */}
        {activeTab === 'outgoing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {outgoingTrades.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  No outgoing trades
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Create a trade request to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoingTrades.map((trade) => (
                  <motion.div
                    key={trade.id}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-6 h-6 text-green-500" />
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-gray-200">
                            To: {trade.receiver.username}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(trade.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        trade.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        trade.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {trade.status.toUpperCase()}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      {/* Offered Item */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You Offer:</p>
                        {trade.offered_item ? (
                          <div className={`border-2 rounded-lg p-3 ${getRarityColor(trade.offered_item.rarity)}`}>
                            <div className="text-2xl mb-1">{trade.offered_item.image_url}</div>
                            <div className="font-semibold text-sm">{trade.offered_item.name}</div>
                            <div className="text-xs opacity-75">{trade.offered_item.rarity}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">Nothing</div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-center">
                        <ArrowRightLeft className="w-6 h-6 text-gray-400 mx-auto" />
                      </div>

                      {/* Requested Item */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">You Want:</p>
                        {trade.requested_item ? (
                          <div className={`border-2 rounded-lg p-3 ${getRarityColor(trade.requested_item.rarity)}`}>
                            <div className="text-2xl mb-1">{trade.requested_item.image_url}</div>
                            <div className="font-semibold text-sm">{trade.requested_item.name}</div>
                            <div className="text-xs opacity-75">{trade.requested_item.rarity}</div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">Anything</div>
                        )}
                      </div>
                    </div>

                    {trade.message && (
                      <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          "{trade.message}"
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
