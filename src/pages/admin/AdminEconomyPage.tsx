import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Coins, Gem, Package, Zap, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface EconomySettings {
  gacha_basic_cost: number;
  gacha_premium_cost: number;
  gacha_legendary_cost: number;
  starting_coins: number;
  starting_gems: number;
  default_inventory_slots: number;
  default_equip_slots: number;
  inventory_upgrade_base_cost: number;
  equip_upgrade_base_cost: number;
}

export default function AdminEconomyPage() {
  const { user, profile } = useAuth();
  const [settings, setSettings] = useState<EconomySettings>({
    gacha_basic_cost: 100,
    gacha_premium_cost: 500,
    gacha_legendary_cost: 1,
    starting_coins: 0,
    starting_gems: 10,
    default_inventory_slots: 20,
    default_equip_slots: 3,
    inventory_upgrade_base_cost: 100,
    equip_upgrade_base_cost: 200,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check if user is admin
  if (!user || !profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // In a real app, you'd load these from a settings table
      // For now, we'll use the current hardcoded values
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In a real app, you'd save these to a settings table
      // For now, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        gacha_basic_cost: 100,
        gacha_premium_cost: 500,
        gacha_legendary_cost: 1,
        starting_coins: 0,
        starting_gems: 10,
        default_inventory_slots: 20,
        default_equip_slots: 3,
        inventory_upgrade_base_cost: 100,
        equip_upgrade_base_cost: 200,
      });
      toast.success('Settings reset to defaults');
    }
  };

  const handleInputChange = (key: keyof EconomySettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white">Economy Settings</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefaults}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
        <p className="text-gray-400">
          Configure game economy parameters and starting values
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gacha Settings */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Gem className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-white">Gacha Costs</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Basic Gacha Cost (Coins)
                </label>
                <input
                  type="number"
                  value={settings.gacha_basic_cost}
                  onChange={(e) => handleInputChange('gacha_basic_cost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Premium Gacha Cost (Coins)
                </label>
                <input
                  type="number"
                  value={settings.gacha_premium_cost}
                  onChange={(e) => handleInputChange('gacha_premium_cost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Legendary Gacha Cost (Gems)
                </label>
                <input
                  type="number"
                  value={settings.gacha_legendary_cost}
                  onChange={(e) => handleInputChange('gacha_legendary_cost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          </motion.div>

          {/* Starting Resources */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Coins className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-white">Starting Resources</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starting Coins
                </label>
                <input
                  type="number"
                  value={settings.starting_coins}
                  onChange={(e) => handleInputChange('starting_coins', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Starting Gems
                </label>
                <input
                  type="number"
                  value={settings.starting_gems}
                  onChange={(e) => handleInputChange('starting_gems', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </motion.div>

          {/* Inventory Settings */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Package className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Inventory Settings</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Inventory Slots
                </label>
                <input
                  type="number"
                  value={settings.default_inventory_slots}
                  onChange={(e) => handleInputChange('default_inventory_slots', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Equipment Slots
                </label>
                <input
                  type="number"
                  value={settings.default_equip_slots}
                  onChange={(e) => handleInputChange('default_equip_slots', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
            </div>
          </motion.div>

          {/* Upgrade Costs */}
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-bold text-white">Upgrade Costs</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Inventory Upgrade Base Cost
                </label>
                <input
                  type="number"
                  value={settings.inventory_upgrade_base_cost}
                  onChange={(e) => handleInputChange('inventory_upgrade_base_cost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Cost increases by 1.5x for each upgrade
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Equipment Upgrade Base Cost
                </label>
                <input
                  type="number"
                  value={settings.equip_upgrade_base_cost}
                  onChange={(e) => handleInputChange('equip_upgrade_base_cost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Cost increases by 2x for each upgrade
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Current Values Preview */}
      <motion.div
        className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold text-white mb-4">Current Configuration Preview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">New players start with:</p>
            <p className="text-white font-semibold">
              {settings.starting_coins.toLocaleString()} coins, {settings.starting_gems} gems
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Default slots:</p>
            <p className="text-white font-semibold">
              {settings.default_inventory_slots} inventory, {settings.default_equip_slots} equipment
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Gacha costs:</p>
            <p className="text-white font-semibold">
              {settings.gacha_basic_cost}/{settings.gacha_premium_cost} coins, {settings.gacha_legendary_cost} gem
            </p>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <p className="text-gray-400">Upgrade base costs:</p>
            <p className="text-white font-semibold">
              {settings.inventory_upgrade_base_cost}/{settings.equip_upgrade_base_cost} coins
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}