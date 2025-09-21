import { useState, useEffect } from 'react';
import { supabase, type UserInventory, type Item } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useInventory() {
  const [inventory, setInventory] = useState<UserInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_inventory')
        .select(`
          *,
          items (*)
        `)
        .eq('user_id', user.id)
        .order('obtained_at', { ascending: false });

      if (error) {
        console.error('Error loading inventory:', error);
        toast.error('Failed to load inventory');
        return;
      }

      setInventory(data as UserInventory[]);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const equipItem = async (inventoryId: string, isEquipped: boolean) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_inventory')
        .update({ is_equipped: isEquipped })
        .eq('id', inventoryId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error equipping item:', error);
        toast.error('Failed to equip item');
        return false;
      }

      // Update local state
      setInventory(prev => 
        prev.map(item => 
          item.id === inventoryId 
            ? { ...item, is_equipped: isEquipped }
            : item
        )
      );

      toast.success(isEquipped ? 'Item equipped!' : 'Item unequipped!');
      return true;
    } catch (error) {
      console.error('Error equipping item:', error);
      toast.error('Failed to equip item');
      return false;
    }
  };

  const addItemToInventory = async (itemId: string, quantity: number = 1) => {
    if (!user) return false;

    try {
      // Check if item already exists in inventory
      const existingItem = inventory.find(inv => inv.item_id === itemId);

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('user_inventory')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await supabase
          .from('user_inventory')
          .insert({
            user_id: user.id,
            item_id: itemId,
            quantity,
          });

        if (error) throw error;
      }

      // Reload inventory
      await loadInventory();
      return true;
    } catch (error) {
      console.error('Error adding item to inventory:', error);
      return false;
    }
  };

  return {
    inventory,
    loading,
    loadInventory,
    equipItem,
    addItemToInventory,
  };
}
