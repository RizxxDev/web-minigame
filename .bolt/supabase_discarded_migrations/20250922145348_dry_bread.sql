/*
  # Advanced Clicker Game Schema

  1. New Tables
    - Enhanced game_progress with max_inventory and max_equip
    - currency_transactions for tracking coin/gem flow
    - trade_items for multi-item trades with custom amounts
    - Enhanced items with drop rates
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for users and admins
    
  3. Functions
    - Enhanced transfer_item function with slot validation
    - Currency tracking functions
*/

-- Add new columns to existing tables
ALTER TABLE game_progress 
ADD COLUMN IF NOT EXISTS max_inventory INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS max_equip INTEGER DEFAULT 3;

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS drop_rate_basic DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS drop_rate_premium DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS drop_rate_legendary DECIMAL(5,2) DEFAULT 0.00;

-- Currency transactions table
CREATE TABLE IF NOT EXISTS currency_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  currency TEXT NOT NULL CHECK (currency IN ('coins', 'gems')),
  amount BIGINT NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trade items table for multi-item trades
CREATE TABLE IF NOT EXISTS trade_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('offer', 'request')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_currency_transactions_user_id ON currency_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_created_at ON currency_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_currency_transactions_currency ON currency_transactions(currency);
CREATE INDEX IF NOT EXISTS idx_trade_items_trade_id ON trade_items(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_items_user_id ON trade_items(user_id);

-- Enable RLS
ALTER TABLE currency_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for currency_transactions
CREATE POLICY "Users can view own transactions"
  ON currency_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON currency_transactions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "System can insert transactions"
  ON currency_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for trade_items
CREATE POLICY "Users can view trade items they're involved in"
  ON trade_items
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = trade_id 
      AND (trades.sender_id = auth.uid() OR trades.receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can create trade items for their trades"
  ON trade_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = trade_id 
      AND trades.sender_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all trade items"
  ON trade_items
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Function to record currency transactions
CREATE OR REPLACE FUNCTION record_currency_transaction(
  p_user_id UUID,
  p_currency TEXT,
  p_amount BIGINT,
  p_reason TEXT,
  p_reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO currency_transactions (user_id, currency, amount, reason, reference_id)
  VALUES (p_user_id, p_currency, p_amount, p_reason, p_reference_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced transfer function with slot validation
CREATE OR REPLACE FUNCTION transfer_items_with_validation(
  p_trade_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  trade_record trades%ROWTYPE;
  sender_slots INTEGER;
  receiver_slots INTEGER;
  receiver_used_slots INTEGER;
  items_to_transfer INTEGER;
  trade_item RECORD;
BEGIN
  -- Get trade details
  SELECT * INTO trade_record FROM trades WHERE id = p_trade_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get receiver's max inventory and current usage
  SELECT max_inventory INTO receiver_slots 
  FROM game_progress 
  WHERE user_id = trade_record.receiver_id;
  
  SELECT COALESCE(SUM(quantity), 0) INTO receiver_used_slots
  FROM user_inventory 
  WHERE user_id = trade_record.receiver_id;
  
  -- Count items being offered
  SELECT COALESCE(SUM(quantity), 0) INTO items_to_transfer
  FROM trade_items 
  WHERE trade_id = p_trade_id AND type = 'offer';
  
  -- Check if receiver has enough slots
  IF (receiver_used_slots + items_to_transfer) > receiver_slots THEN
    RETURN FALSE;
  END IF;
  
  -- Transfer offered items
  FOR trade_item IN 
    SELECT ti.item_id, ti.quantity
    FROM trade_items ti
    WHERE ti.trade_id = p_trade_id AND ti.type = 'offer'
  LOOP
    -- Remove from sender
    UPDATE user_inventory 
    SET quantity = quantity - trade_item.quantity,
        is_equipped = false
    WHERE user_id = trade_record.sender_id 
    AND item_id = trade_item.item_id;
    
    -- Delete if quantity becomes 0
    DELETE FROM user_inventory 
    WHERE user_id = trade_record.sender_id 
    AND item_id = trade_item.item_id 
    AND quantity <= 0;
    
    -- Add to receiver
    INSERT INTO user_inventory (user_id, item_id, quantity, is_equipped)
    VALUES (trade_record.receiver_id, trade_item.item_id, trade_item.quantity, false)
    ON CONFLICT (user_id, item_id)
    DO UPDATE SET quantity = user_inventory.quantity + trade_item.quantity;
  END LOOP;
  
  -- Transfer requested items (if any)
  FOR trade_item IN 
    SELECT ti.item_id, ti.quantity
    FROM trade_items ti
    WHERE ti.trade_id = p_trade_id AND ti.type = 'request'
  LOOP
    -- Remove from receiver
    UPDATE user_inventory 
    SET quantity = quantity - trade_item.quantity,
        is_equipped = false
    WHERE user_id = trade_record.receiver_id 
    AND item_id = trade_item.item_id;
    
    -- Delete if quantity becomes 0
    DELETE FROM user_inventory 
    WHERE user_id = trade_record.receiver_id 
    AND item_id = trade_item.item_id 
    AND quantity <= 0;
    
    -- Add to sender
    INSERT INTO user_inventory (user_id, item_id, quantity, is_equipped)
    VALUES (trade_record.sender_id, trade_item.item_id, trade_item.quantity, false)
    ON CONFLICT (user_id, item_id)
    DO UPDATE SET quantity = user_inventory.quantity + trade_item.quantity;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample items with drop rates
INSERT INTO items (name, description, rarity, effect_type, effect_value, image_url, drop_rate_basic, drop_rate_premium, drop_rate_legendary) VALUES
('Wooden Clicker', 'A simple wooden clicking tool', 'common', 'click_power', 1, '🪵', 25.00, 15.00, 5.00),
('Iron Clicker', 'A sturdy iron clicking device', 'common', 'click_power', 2, '⚙️', 20.00, 12.00, 4.00),
('Lucky Coin', 'Increases coin generation', 'common', 'coin_multiplier', 1, '🪙', 15.00, 10.00, 3.00),
('Auto Finger', 'Clicks automatically', 'rare', 'auto_power', 1, '👆', 8.00, 15.00, 8.00),
('Golden Clicker', 'A premium golden clicker', 'rare', 'click_power', 5, '🏆', 6.00, 12.00, 7.00),
('Magic Wand', 'Mystical clicking power', 'epic', 'click_power', 10, '🪄', 2.00, 8.00, 12.00),
('Diamond Ring', 'Precious gem multiplier', 'epic', 'coin_multiplier', 3, '💍', 1.50, 6.00, 10.00),
('Robot Hand', 'Advanced auto-clicker', 'epic', 'auto_power', 5, '🤖', 1.00, 5.00, 8.00),
('Infinity Gauntlet', 'Ultimate power', 'legendary', 'click_power', 50, '♾️', 0.30, 2.00, 15.00),
('Midas Touch', 'Everything turns to gold', 'legendary', 'coin_multiplier', 10, '✨', 0.20, 1.50, 12.00),
('Time Machine', 'Auto-clicks through time', 'legendary', 'auto_power', 20, '⏰', 0.10, 1.00, 8.00)
ON CONFLICT (name) DO NOTHING;