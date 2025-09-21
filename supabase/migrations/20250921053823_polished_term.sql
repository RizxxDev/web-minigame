/*
  # Add gems to game progress and admin role

  1. Changes
    - Add `gems` column to game_progress table
    - Add `total_spent` column to track spending
    - Add `role` column to profiles table for admin functionality

  2. Security
    - Update existing policies
    - Add admin policies
*/

-- Add gems and total_spent to game_progress if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_progress' AND column_name = 'gems'
  ) THEN
    ALTER TABLE game_progress ADD COLUMN gems bigint DEFAULT 10;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'game_progress' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE game_progress ADD COLUMN total_spent bigint DEFAULT 0;
  END IF;
END $$;

-- Add role to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Create admin policies for items
CREATE POLICY "Admins can manage items"
  ON items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create admin policies for trades
CREATE POLICY "Admins can view all trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all trades"
  ON trades
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create admin policies for user_inventory
CREATE POLICY "Admins can view all inventories"
  ON user_inventory
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create admin policies for game_progress
CREATE POLICY "Admins can view all progress"
  ON game_progress
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all progress"
  ON game_progress
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );