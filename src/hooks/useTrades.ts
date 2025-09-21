import { useState, useEffect } from 'react';
import { supabase, type Trade } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useTrades() {
  const [incomingTrades, setIncomingTrades] = useState<Trade[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load incoming trades
      const { data: incoming, error: incomingError } = await supabase
        .from('trades')
        .select(`
          *,
          sender:sender_id (username),
          receiver:receiver_id (username),
          offered_item:offered_item_id (*),
          requested_item:requested_item_id (*)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (incomingError) {
        console.error('Error loading incoming trades:', incomingError);
      } else {
        setIncomingTrades(incoming as Trade[]);
      }

      // Load outgoing trades
      const { data: outgoing, error: outgoingError } = await supabase
        .from('trades')
        .select(`
          *,
          sender:sender_id (username),
          receiver:receiver_id (username),
          offered_item:offered_item_id (*),
          requested_item:requested_item_id (*)
        `)
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false });

      if (outgoingError) {
        console.error('Error loading outgoing trades:', outgoingError);
      } else {
        setOutgoingTrades(outgoing as Trade[]);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      toast.error('Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const createTrade = async (
    receiverUsername: string,
    offeredItemId: string | null,
    offeredQuantity: number,
    requestedItemId: string | null,
    requestedQuantity: number,
    message?: string
  ) => {
    if (!user) return false;

    try {
      // Find receiver by username
      const { data: receiver, error: receiverError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', receiverUsername)
        .single();

      if (receiverError || !receiver) {
        toast.error('User not found');
        return false;
      }

      if (receiver.id === user.id) {
        toast.error('Cannot trade with yourself');
        return false;
      }

      // Create trade
      const { error } = await supabase
        .from('trades')
        .insert({
          sender_id: user.id,
          receiver_id: receiver.id,
          offered_item_id: offeredItemId,
          offered_quantity: offeredQuantity,
          requested_item_id: requestedItemId,
          requested_quantity: requestedQuantity,
          message,
        });

      if (error) {
        console.error('Error creating trade:', error);
        toast.error('Failed to create trade');
        return false;
      }

      toast.success('Trade request sent!');
      await loadTrades();
      return true;
    } catch (error) {
      console.error('Error creating trade:', error);
      toast.error('Failed to create trade');
      return false;
    }
  };

  const acceptTrade = async (tradeId: string) => {
    if (!user) return false;

    try {
      // Get trade details
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .single();

      if (tradeError || !trade) {
        toast.error('Trade not found');
        return false;
      }

      // Start transaction-like operations
      // Update trade status
      const { error: updateError } = await supabase
        .from('trades')
        .update({ status: 'accepted' })
        .eq('id', tradeId);

      if (updateError) {
        console.error('Error updating trade:', updateError);
        toast.error('Failed to accept trade');
        return false;
      }

      // Transfer items (simplified - in production, use database functions)
      if (trade.offered_item_id) {
        // Remove item from sender, add to receiver
        await supabase.rpc('transfer_item', {
          from_user: trade.sender_id,
          to_user: trade.receiver_id,
          item_id: trade.offered_item_id,
          quantity: trade.offered_quantity,
        });
      }

      if (trade.requested_item_id) {
        // Remove item from receiver, add to sender
        await supabase.rpc('transfer_item', {
          from_user: trade.receiver_id,
          to_user: trade.sender_id,
          item_id: trade.requested_item_id,
          quantity: trade.requested_quantity,
        });
      }

      toast.success('Trade accepted!');
      await loadTrades();
      return true;
    } catch (error) {
      console.error('Error accepting trade:', error);
      toast.error('Failed to accept trade');
      return false;
    }
  };

  const rejectTrade = async (tradeId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('trades')
        .update({ status: 'rejected' })
        .eq('id', tradeId)
        .eq('receiver_id', user.id);

      if (error) {
        console.error('Error rejecting trade:', error);
        toast.error('Failed to reject trade');
        return false;
      }

      toast.success('Trade rejected');
      await loadTrades();
      return true;
    } catch (error) {
      console.error('Error rejecting trade:', error);
      toast.error('Failed to reject trade');
      return false;
    }
  };

  return {
    incomingTrades,
    outgoingTrades,
    loading,
    loadTrades,
    createTrade,
    acceptTrade,
    rejectTrade,
  };
}
