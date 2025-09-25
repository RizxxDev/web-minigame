import { useState, useEffect } from 'react';
import { supabase, type UserInventory, type Item } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from './useGameProgress';
import toast from 'react-hot-toast';

export function useInventory() {
  const [inventory, setInventory] = useState<UserInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { progress, saveProgress } = useGameProgress();

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
    
    // Check max equip limit when equipping
    if (isEquipped && progress) {
      const currentEquipped = inventory.filter(item => item.is_equipped).length;
      if (currentEquipped >= progress.max_equip) {
        toast.error(`You can only equip ${progress.max_equip} items at once!`);
        return false;
      }
    }

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
      
      // Recalculate and apply item effects
      if (progress) {
        await recalculateEffects();
      }
      
      return true;
    } catch (error) {
      console.error('Error equipping item:', error);
      toast.error('Failed to equip item');
      return false;
    }
  };

  const recalculateEffects = async () => {
    if (!user || !progress) return;

    // Get all equipped items
    const equippedItems = inventory.filter(item => item.is_equipped);
    
    // Calculate total effects
    let totalClickPower = 1; // Base click power
    let totalAutoPower = 1; // Base auto power
    let totalCoinMultiplier = 1; // Base multiplier
    
    equippedItems.forEach(inventoryItem => {
      const item = inventoryItem.items;
      switch (item.effect_type) {
        case 'click_power':
          totalClickPower += item.effect_value * inventoryItem.quantity;
          break;
        case 'auto_power':
          totalAutoPower += item.effect_value * inventoryItem.quantity;
          break;
        case 'coin_multiplier':
          totalCoinMultiplier += item.effect_value * inventoryItem.quantity;
          break;
      }
    });
    
    // Update progress with new values
    await saveProgress({
      ...progress,
      click_power: totalClickPower,
      auto_click_power: totalAutoPower,
    });
  };

  const upgradeInventorySlot = async () => {
    if (!user || !progress) return false;

    const cost = Math.floor(100 * Math.pow(1.5, progress.max_inventory - 20));
    
    if (progress.coins < cost) {
      toast.error('Not enough coins!');
      return false;
    }

    try {
      const updatedProgress = {
        ...progress,
        coins: progress.coins - cost,
        max_inventory: progress.max_inventory + 1,
        total_spent: progress.total_spent + cost,
      };

      await saveProgress(updatedProgress);
      toast.success('Inventory slot upgraded!');
      return true;
    } catch (error) {
      console.error('Error upgrading inventory:', error);
      toast.error('Failed to upgrade inventory');
      return false;
    }
  };

  const getInventorySlotCost = () => {
    if (!progress) return 0;
    return Math.floor(100 * Math.pow(1.5, progress.max_inventory - 20));
  };

  const addItemToInventory = async (itemId: string, quantity: number = 1) => {
    if (!user) return false;
    
    // Check inventory space
    if (progress) {
      const currentItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
      if (currentItems + quantity > progress.max_inventory) {
        toast.error('Not enough inventory space!');
        return false;
      }
    }

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
    upgradeInventorySlot,
    getInventorySlotCost,
    addItemToInventory,
    recalculateEffects,
  };
}
