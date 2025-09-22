import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
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
  max_inventory: number;
  max_equip: number;
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
  drop_rate_basic: number;
  drop_rate_premium: number;
  drop_rate_legendary: number;
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
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  created_at: string;
  updated_at: string;
  sender: Pick<Profile, 'username'>;
  receiver: Pick<Profile, 'username'>;
  trade_items: TradeItem[];
};

export type TradeItem = {
  id: string;
  trade_id: string;
  user_id: string;
  item_id: string;
  quantity: number;
  type: 'offer' | 'request';
  created_at: string;
  items: Item;
};

export type CurrencyTransaction = {
  id: string;
  user_id: string;
  currency: 'coins' | 'gems';
  amount: number;
  reason: string;
  reference_id: string | null;
  created_at: string;
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
