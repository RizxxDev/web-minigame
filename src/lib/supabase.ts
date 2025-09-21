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
  gems: number;
  total_spent: number;
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

export type Item = {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effect_type: 'click_power' | 'auto_power' | 'coin_multiplier' | null;
  effect_value: number;
  image_url: string;
  created_at: string;
};

export type UserInventory = {
  id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  obtained_at: string;
  items: Item;
};

export type Trade = {
  id: string;
  sender_id: string;
  receiver_id: string;
  offered_item_id: string | null;
  offered_quantity: number;
  requested_item_id: string | null;
  requested_quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  created_at: string;
  updated_at: string;
  sender: Pick<Profile, 'username'>;
  receiver: Pick<Profile, 'username'>;
  offered_item: Item | null;
  requested_item: Item | null;
};

export type GachaHistory = {
  id: string;
  user_id: string;
  tier: 'basic' | 'premium' | 'legendary';
  cost_type: 'coins' | 'gems';
  cost_amount: number;
  item_received: string;
  created_at: string;
  items: Item;
};
