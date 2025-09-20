import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type GameProgress = {
  id: string;
  user_id: string;
  score: number;
  clicks: number;
  click_power: number;
  auto_clickers: number;
  auto_click_power: number;
  coins: number;
  created_at: string;
  updated_at: string;
};

export type UserSettings = {
  id: string;
  user_id: string;
  theme: 'light' | 'dark';
  updated_at: string;
};

export type LeaderboardEntry = GameProgress & {
  profiles: Pick<Profile, 'username'>;
};