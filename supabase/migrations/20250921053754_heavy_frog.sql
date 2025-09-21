/*
  # Create gacha and inventory system

  1. New Tables
    - `items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `rarity` (text: common, rare, epic, legendary)
      - `effect_type` (text: click_power, auto_power, coin_multiplier)
      - `effect_value` (integer)
      - `image_url` (text)
      - `created_at` (timestamp)
    - `user_inventory`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `item_id` (uuid, references items)
      - `quantity` (integer)
      - `is_equipped` (boolean)
      - `obtained_at` (timestamp)
    - `gacha_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `tier` (text: basic, premium, legendary)
      - `cost_type` (text: coins, gems)
      - `cost_amount` (integer)
      - `item_received` (uuid, references items)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  rarity text NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  effect_type text CHECK (effect_type IN ('click_power', 'auto_power', 'coin_multiplier')),
  effect_value integer DEFAULT 0,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_inventory table
CREATE TABLE IF NOT EXISTS user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  quantity integer DEFAULT 1,
  is_equipped boolean DEFAULT false,
  obtained_at timestamptz DEFAULT now()
);

-- Create gacha_history table
CREATE TABLE IF NOT EXISTS gacha_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL CHECK (tier IN ('basic', 'premium', 'legendary')),
  cost_type text NOT NULL CHECK (cost_type IN ('coins', 'gems')),
  cost_amount integer NOT NULL,
  item_received uuid REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE gacha_history ENABLE ROW LEVEL SECURITY;

-- Create policies for items (public read)
CREATE POLICY "Anyone can view items"
  ON items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for user_inventory
CREATE POLICY "Users can view own inventory"
  ON user_inventory
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inventory"
  ON user_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON user_inventory
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for gacha_history
CREATE POLICY "Users can view own gacha history"
  ON gacha_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gacha history"
  ON gacha_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_item_id ON user_inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_gacha_history_user_id ON gacha_history(user_id);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);

-- Insert sample items
INSERT INTO items (name, description, rarity, effect_type, effect_value, image_url) VALUES
  ('Basic Clicker', 'A simple clicking tool', 'common', 'click_power', 1, '🖱️'),
  ('Power Glove', 'Increases your clicking power', 'common', 'click_power', 2, '🧤'),
  ('Magic Wand', 'A mystical clicking enhancer', 'rare', 'click_power', 5, '🪄'),
  ('Auto Bot', 'Clicks automatically for you', 'rare', 'auto_power', 3, '🤖'),
  ('Golden Hammer', 'A powerful clicking weapon', 'epic', 'click_power', 10, '🔨'),
  ('Crystal Orb', 'Multiplies your coin earnings', 'epic', 'coin_multiplier', 2, '🔮'),
  ('Dragon Claw', 'The ultimate clicking tool', 'legendary', 'click_power', 25, '🐲'),
  ('Time Machine', 'Super powerful auto-clicker', 'legendary', 'auto_power', 15, '⏰'),
  ('Midas Touch', 'Turns everything to gold', 'legendary', 'coin_multiplier', 5, '✨'),
  ('Lucky Charm', 'Brings good fortune', 'common', 'coin_multiplier', 1, '🍀'),
  ('Speed Boots', 'Increases clicking speed', 'rare', 'click_power', 3, '👟'),
  ('Energy Drink', 'Boosts your performance', 'common', 'click_power', 1, '🥤'),
  ('Turbo Engine', 'Powers up auto-clickers', 'epic', 'auto_power', 8, '🚀'),
  ('Diamond Ring', 'Precious and powerful', 'legendary', 'click_power', 20, '💎'),
  ('Coin Magnet', 'Attracts more coins', 'rare', 'coin_multiplier', 2, '🧲');