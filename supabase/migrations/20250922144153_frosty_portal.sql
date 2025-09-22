@@ .. @@
 -- Create function to transfer items between users
 CREATE OR REPLACE FUNCTION transfer_item(
   from_user uuid,
-  to_user uuid,
   item_id uuid,
-  quantity integer
+  quantity integer,
+  to_user uuid
 )
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 AS $$
 BEGIN
   -- Remove item from sender
   UPDATE user_inventory 
-  SET quantity = quantity - quantity
-  WHERE user_id = from_user AND item_id = item_id AND quantity >= quantity;
+  SET quantity = user_inventory.quantity - transfer_item.quantity
+  WHERE user_id = from_user AND user_inventory.item_id = transfer_item.item_id AND user_inventory.quantity >= transfer_item.quantity;
   
   -- Add item to receiver or update quantity
   INSERT INTO user_inventory (user_id, item_id, quantity)
-  VALUES (to_user, item_id, quantity)
+  VALUES (to_user, transfer_item.item_id, transfer_item.quantity)
   ON CONFLICT (user_id, item_id) 
-  DO UPDATE SET quantity = user_inventory.quantity + quantity;
+  DO UPDATE SET quantity = user_inventory.quantity + transfer_item.quantity;
   
   -- Remove zero quantity items
   DELETE FROM user_inventory WHERE quantity <= 0;
   
   RETURN true;
 END;
 $$;