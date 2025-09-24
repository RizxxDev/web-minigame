/*
  # Advanced Clicker Game Features

  1. New Tables
    - settings for maintenance mode and other configurations
    - announcements for admin announcements
    - chat_messages for global and private chat
    - Add banned fields to profiles
    
  2. Security
    - Enable RLS on all new tables
    - Add policies for users and admins
    
  3. Functions
    - Chat message functions
    - Maintenance mode checks
*/

-- Add banned fields to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_banned BOOLEAN DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_chat_banned'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_chat_banned BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Settings table for maintenance mode and other configurations
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES profiles(id)
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('global', 'private')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_private ON chat_messages(sender_id, receiver_id, created_at DESC) WHERE type = 'private';

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for settings
CREATE POLICY "Anyone can view settings"
  ON settings
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for announcements
CREATE POLICY "Anyone can view active announcements"
  ON announcements
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Admins can view all announcements"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view global messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    type = 'global' OR 
    (type = 'private' AND (sender_id = auth.uid() OR receiver_id = auth.uid()))
  );

CREATE POLICY "Non-banned users can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_chat_banned = true
    )
  );

CREATE POLICY "Admins can view all messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can delete messages"
  ON chat_messages
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Function to check if user is banned
CREATE OR REPLACE FUNCTION is_user_banned(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  banned BOOLEAN;
BEGIN
  SELECT is_banned INTO banned FROM profiles WHERE id = user_id;
  RETURN COALESCE(banned, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check maintenance mode
CREATE OR REPLACE FUNCTION is_maintenance_mode()
RETURNS BOOLEAN AS $$
DECLARE
  maintenance BOOLEAN;
BEGIN
  SELECT CASE WHEN value = 'true' THEN true ELSE false END 
  INTO maintenance 
  FROM settings 
  WHERE key = 'maintenance_mode';
  
  RETURN COALESCE(maintenance, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('max_chat_history', '100'),
  ('chat_rate_limit', '5')
ON CONFLICT (key) DO NOTHING;

-- Insert sample announcements
INSERT INTO announcements (title, message, created_by) VALUES
  ('Welcome to ClickMaster!', 'Welcome to the ultimate clicker game experience! Start clicking and collecting amazing items.', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)),
  ('New Gacha Items Available', 'Check out the new legendary items in the gacha system. Better drop rates this week!', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1))
ON CONFLICT DO NOTHING;