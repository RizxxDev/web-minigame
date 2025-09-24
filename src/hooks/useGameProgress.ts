import { useState, useEffect } from 'react';
import { supabase, type GameProgress } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading progress:', error);
        toast.error('Failed to load game progress');
        return;
      }

      if (data) {
        setProgress(data);
      } else {
        // Create initial progress if it doesn't exist
        const { data: newProgress, error: insertError } = await supabase
          .from('game_progress')
          .insert([
            {
              user_id: user.id,
              score: 0,
              clicks: 0,
              click_power: 1,
              auto_clickers: 0,
              auto_click_power: 1,
              coins: 0,
              gems: 0,
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating progress:', insertError);
          toast.error('Failed to create game progress');
        } else {
          setProgress(newProgress);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      toast.error('Failed to load game progress');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (updatedProgress: Partial<GameProgress>) => {
    if (!user || !progress) return;

    try {
      const { error } = await supabase
        .from('game_progress')
        .update(updatedProgress)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving progress:', error);
        toast.error('Failed to save progress');
        return false;
      }

      setProgress({ ...progress, ...updatedProgress });
      return true;
    } catch (error) {
      console.error('Error saving progress:', error);
      toast.error('Failed to save progress');
      return false;
    }
  };

  const resetProgress = async () => {
    if (!user) return;

    try {
      const resetData = {
        score: 0,
        clicks: 0,
        click_power: 1,
        auto_clickers: 0,
        auto_click_power: 1,
        coins: 0,
        gems: 10,
        total_spent: 0,
      };

      const { error } = await supabase
        .from('game_progress')
        .update(resetData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error resetting progress:', error);
        toast.error('Failed to reset progress');
        return false;
      }

      setProgress({ ...progress!, ...resetData });
      toast.success('Progress reset successfully!');
      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
      return false;
    }
  };

  return {
    progress,
    loading,
    saveProgress,
    resetProgress,
    loadProgress,
  };
}

