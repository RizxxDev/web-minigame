import { useState } from 'react';
import { supabase, type Item } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useGameProgress } from './useGameProgress';
import { useInventory } from './useInventory';
import toast from 'react-hot-toast';

export type GachaTier = 'basic' | 'premium' | 'legendary';

export interface GachaResult {
  item: Item;
  isNew: boolean;
}

export function useGacha() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { progress, saveProgress } = useGameProgress();
  const { addItemToInventory } = useInventory();

  const gachaCosts = {
    basic: { type: 'coins' as const, amount: 100 },
    premium: { type: 'coins' as const, amount: 500 },
    legendary: { type: 'gems' as const, amount: 1 },
  };

  const rarityWeights = {
    basic: { common: 70, rare: 25, epic: 4, legendary: 1 },
    premium: { common: 40, rare: 40, epic: 15, legendary: 5 },
    legendary: { common: 20, rare: 30, epic: 30, legendary: 20 },
  };

  const pullGacha = async (tier: GachaTier): Promise<GachaResult | null> => {
    if (!user || !progress) return null;

    const cost = gachaCosts[tier];

    setLoading(true);
    try {
      // Get all items
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (itemsError || !items) {
        toast.error('Failed to load items');
        return null;
      }

      // Determine rarity based on weights
      const weights = rarityWeights[tier];
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      const random = Math.random() * totalWeight;
      
      let currentWeight = 0;
      let selectedRarity: keyof typeof weights = 'common';
      
      for (const [rarity, weight] of Object.entries(weights)) {
        currentWeight += weight;
        if (random <= currentWeight) {
          selectedRarity = rarity as keyof typeof weights;
          break;
        }
      }

      // Get items of selected rarity
      const rarityItems = items.filter(item => item.rarity === selectedRarity);
      if (rarityItems.length === 0) {
        toast.error('No items available for this rarity');
        return null;
      }

      // Select random item from rarity
      const selectedItem = rarityItems[Math.floor(Math.random() * rarityItems.length)];

      // Add item to inventory
      const isNew = await addItemToInventory(selectedItem.id);

      // Record gacha history
      await supabase
        .from('gacha_history')
        .insert({
          user_id: user.id,
          tier,
          cost_type: cost.type,
          cost_amount: cost.amount,
          item_received: selectedItem.id,
        });

      toast.success(`🎉 Got ${selectedItem.name}!`);
      
      return {
        item: selectedItem,
        isNew: isNew || false,
      };
    } catch (error) {
      console.error('Error pulling gacha:', error);
      toast.error('Failed to pull gacha');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    pullGacha,
    loading,
    gachaCosts,
  };
}
