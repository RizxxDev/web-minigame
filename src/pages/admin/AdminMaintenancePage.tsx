import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Power, PowerOff, AlertTriangle, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminMaintenancePage() {
  const { user, profile } = useAuth();
  const { isMaintenanceMode, checkMaintenanceMode } = useMaintenance();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    maintenance_message: 'We are currently performing scheduled maintenance to improve your gaming experience.',
    estimated_duration: '15-30 minutes',
  });

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
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['maintenance_mode', 'maintenance_message', 'estimated_duration']);

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      setSettings({
        maintenance_mode: settingsMap.maintenance_mode === 'true',
        maintenance_message: settingsMap.maintenance_message || settings.maintenance_message,
        estimated_duration: settingsMap.estimated_duration || settings.estimated_duration,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: 'maintenance_mode', value: settings.maintenance_mode.toString() },
        { key: 'maintenance_message', value: settings.maintenance_message },
        { key: 'estimated_duration', value: settings.estimated_duration },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .upsert({
            key: update.key,
            value: update.value,
            updated_by: user.id,
          });

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
      await checkMaintenanceMode();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newMode = !settings.maintenance_mode;
    setSettings(prev => ({ ...prev, maintenance_mode: newMode }));
    
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'maintenance_mode',
          value: newMode.toString(),
          updated_by: user.id,
        });

      if (error) throw error;

      toast.success(`Maintenance mode ${newMode ? 'enabled' : 'disabled'}`);
      await checkMaintenanceMode();
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
      // Revert the state change
      setSettings(prev => ({ ...prev, maintenance_mode: !newMode }));
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Wrench className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold text-white">Maintenance Settings</h1>
        </div>
        <p className="text-gray-400">
          Control system maintenance mode and settings
        </p>
      </motion.div>

      {/* Current Status */}
      <motion.div
        className={`mb-8 p-6 rounded-xl border-2 ${
          isMaintenanceMode
            ? 'bg-red-500/10 border-red-500/50'
            : 'bg-green-500/10 border-green-500/50'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isMaintenanceMode ? (
              <PowerOff className="w-8 h-8 text-red-400" />
            ) : (
              <Power className="w-8 h-8 text-green-400" />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">
                System Status: {isMaintenanceMode ? 'Maintenance Mode' : 'Online'}
              </h2>
              <p className={`text-sm ${isMaintenanceMode ? 'text-red-400' : 'text-green-400'}`}>
                {isMaintenanceMode 
                  ? 'Players are redirected to maintenance page' 
                  : 'All systems operational'
                }
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleMaintenanceMode}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
              isMaintenanceMode
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isMaintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
          </button>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold text-white mb-6">Maintenance Configuration</h3>

        <div className="space-y-6">
          {/* Maintenance Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maintenance Message
            </label>
            <textarea
              value={settings.maintenance_message}
              onChange={(e) => setSettings(prev => ({ ...prev, maintenance_message: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows={3}
              placeholder="Message shown to players during maintenance"
            />
          </div>

          {/* Estimated Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Estimated Duration
            </label>
            <input
              type="text"
              value={settings.estimated_duration}
              onChange={(e) => setSettings(prev => ({ ...prev, estimated_duration: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., 15-30 minutes"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Warning */}
      <motion.div
        className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-200">
            <p className="font-semibold mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-yellow-300">
              <li>Enabling maintenance mode will redirect all non-admin users to the maintenance page</li>
              <li>Admin users can still access all pages during maintenance</li>
              <li>Changes to maintenance settings take effect immediately</li>
              <li>Make sure to communicate maintenance schedules to your players in advance</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}