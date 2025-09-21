/*
  # Create trading system

  1. New Tables
    - `trades`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `offered_item_id` (uuid, references items, nullable)
      - `offered_quantity` (integer)
      - `requested_item_id` (uuid, references items, nullable)
      - `requested_quantity` (integer)
      - `status` (text: pending, accepted, rejected, cancelled)
      - `message` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their trades
*/

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  offered_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  offered_quantity integer DEFAULT 1,
  requested_item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  requested_quantity integer DEFAULT 1,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policies for trades
CREATE POLICY "Users can view trades they're involved in"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create trades"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update trades they're involved in"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trades_sender_id ON trades(sender_id);
CREATE INDEX IF NOT EXISTS idx_trades_receiver_id ON trades(receiver_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);

-- Create updated_at trigger for trades
CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON trades
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Create function to transfer items between users
CREATE OR REPLACE FUNCTION transfer_item(
  from_user uuid,
  to_user uuid,
  item_id uuid,
  quantity integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove item from sender
  UPDATE user_inventory 
  SET quantity = quantity - quantity
  WHERE user_id = from_user AND item_id = item_id AND quantity >= quantity;
  
  -- Add item to receiver or update quantity
  INSERT INTO user_inventory (user_id, item_id, quantity)
  VALUES (to_user, item_id, quantity)
  ON CONFLICT (user_id, item_id) 
  DO UPDATE SET quantity = user_inventory.quantity + quantity;
  
  -- Remove zero quantity items
  DELETE FROM user_inventory WHERE quantity <= 0;
  
  RETURN true;
END;
$$;