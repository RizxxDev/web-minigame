import { useState, useEffect } from 'react';
import { supabase, type Trade, type TradeItem } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function useTrades() {
  const [incomingTrades, setIncomingTrades] = useState<Trade[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {import { useState, useEffect } from 'react';
import { supabase, type Trade, type TradeItem } from '../lib/supabase';
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
          trade_items (
            *,
            items (*)
          )
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
          trade_items (
            *,
            items (*)
          )
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
    offeredItems: { itemId: string; quantity: number }[],
    requestedItems: { itemId: string; quantity: number }[],
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
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          sender_id: user.id,
          receiver_id: receiver.id,
          message,
        })
        .select()
        .single();

      if (tradeError || !trade) {
        console.error('Error creating trade:', tradeError);
        toast.error('Failed to create trade');
        return false;
      }

      // Add offered items
      if (offeredItems.length > 0) {
        const { error: offeredError } = await supabase
          .from('trade_items')
          .insert(
            offeredItems.map(item => ({
              trade_id: trade.id,
              user_id: user.id,
              item_id: item.itemId,
              quantity: item.quantity,
              type: 'offer',
            }))
          );

        if (offeredError) {
          console.error('Error adding offered items:', offeredError);
          toast.error('Failed to add offered items');
          return false;
        }
      }

      // Add requested items
      if (requestedItems.length > 0) {
        const { error: requestedError } = await supabase
          .from('trade_items')
          .insert(
            requestedItems.map(item => ({
              trade_id: trade.id,
              user_id: receiver.id,
              item_id: item.itemId,
              quantity: item.quantity,
              type: 'request',
            }))
          );

        if (requestedError) {
          console.error('Error adding requested items:', requestedError);
          toast.error('Failed to add requested items');
          return false;
        }
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

      // Use the enhanced transfer function
      const { data: transferResult, error: transferError } = await supabase
        .rpc('transfer_items_with_validation', { p_trade_id: tradeId });

      if (transferError || !transferResult) {
        console.error('Error transferring items:', transferError);
        toast.error('Failed to transfer items - not enough inventory space');
        return false;
      }

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
          trade_items (
            *,
            items (*)
          )
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
          trade_items (
            *,
            items (*)
          )
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
    offeredItems: { itemId: string; quantity: number }[],
    requestedItems: { itemId: string; quantity: number }[],
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
      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          sender_id: user.id,
          receiver_id: receiver.id,
          message,
        })
        .select()
        .single();

      if (tradeError || !trade) {
        console.error('Error creating trade:', tradeError);
        toast.error('Failed to create trade');
        return false;
      }

      // Add offered items
      if (offeredItems.length > 0) {
        const { error: offeredError } = await supabase
          .from('trade_items')
          .insert(
            offeredItems.map(item => ({
              trade_id: trade.id,
              user_id: user.id,
              item_id: item.itemId,
              quantity: item.quantity,
              type: 'offer',
            }))
          );

        if (offeredError) {
          console.error('Error adding offered items:', offeredError);
          toast.error('Failed to add offered items');
          return false;
        }
      }

      // Add requested items
      if (requestedItems.length > 0) {
        const { error: requestedError } = await supabase
          .from('trade_items')
          .insert(
            requestedItems.map(item => ({
              trade_id: trade.id,
              user_id: receiver.id,
              item_id: item.itemId,
              quantity: item.quantity,
              type: 'request',
            }))
          );

        if (requestedError) {
          console.error('Error adding requested items:', requestedError);
          toast.error('Failed to add requested items');
          return false;
        }
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

      // Use the enhanced transfer function
      const { data: transferResult, error: transferError } = await supabase
        .rpc('transfer_items_with_validation', { p_trade_id: tradeId });

      if (transferError || !transferResult) {
        console.error('Error transferring items:', transferError);
        toast.error('Failed to transfer items - not enough inventory space');
        return false;
      }

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
