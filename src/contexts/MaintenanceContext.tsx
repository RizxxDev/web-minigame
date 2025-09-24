import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface MaintenanceContextType {
  isMaintenanceMode: boolean;
  loading: boolean;
  checkMaintenanceMode: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking maintenance mode:', error);
        return;
      }

      const maintenanceMode = data?.value === 'true';
      setIsMaintenanceMode(maintenanceMode);

      // Redirect non-admin users to maintenance page if maintenance mode is on
      if (maintenanceMode && profile?.role !== 'admin' && location.pathname !== '/maintenance' && location.pathname !== '/login') {
        navigate('/maintenance');
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceMode();

    // Set up real-time subscription for maintenance mode changes
    const subscription = supabase
      .channel('settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.maintenance_mode',
        },
        () => {
          checkMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile, location.pathname, navigate]);

  const value = {
    isMaintenanceMode,
    loading,
    checkMaintenanceMode,
  };

  return (
    <MaintenanceContext.Provider value={value}>
      {children}
    </MaintenanceContext.Provider>
  );
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}